<script setup>
import { computed } from "vue";
import { openDetailModal } from "../composables/useModals";

const props = defineProps({
  data: { type: Object, required: true },
});

// Fixed iteration order only — used to group edges deterministically
// before each agency's ego-graph lays them out (parent departments first,
// so they consistently land above; peer relationships after).
const TYPE_ORDER = ["organizational-parent", "jurisdiction-split", "delegation", "overlapping"];

const edges = computed(() => Object.values(props.data.jurisdictions || {}));

// Ordered by founding year — agencies without a recorded founding date
// (e.g. "State & Local Agencies," a catch-all rather than one organization)
// sort to the end rather than defaulting to the front.
const agencyOptions = computed(() =>
  Object.values(props.data.agencies || {}).sort((a, b) => {
    if (a.founded == null && b.founded == null) return a.name.localeCompare(b.name);
    if (a.founded == null) return 1;
    if (b.founded == null) return -1;
    return a.founded - b.founded;
  })
);

// Every edge touching an agency (either side), grouped by type — this is
// the actual answer to "tell me about FDA," which a flat edge table or an
// all-agencies graph both bury under everything else in the collection.
const edgesByAgency = computed(() => {
  const map = new Map();
  for (const agency of agencyOptions.value) map.set(agency.id, []);
  for (const edge of edges.value) {
    if (map.has(edge.agencyId)) map.get(edge.agencyId).push(edge);
    if (edge.relatedAgencyId && map.has(edge.relatedAgencyId) && edge.relatedAgencyId !== edge.agencyId) {
      map.get(edge.relatedAgencyId).push(edge);
    }
  }
  return map;
});

function edgesByTypeFor(agencyId) {
  const list = edgesByAgency.value.get(agencyId) || [];
  const groups = new Map();
  for (const edge of list) {
    const group = groups.get(edge.type) || [];
    group.push(edge);
    groups.set(edge.type, group);
  }
  return TYPE_ORDER.filter((type) => groups.has(type)).map((type) => ({ type, edges: groups.get(type) }));
}

// The "other side" of an edge relative to a given agency — an edge is
// stored once but can be read from either agency's perspective.
// `direction` records which way authority actually flows, since the graph
// needs to draw an arrow the right way regardless of which agency ID
// happens to be `agencyId` vs `relatedAgencyId` on the underlying record.
function otherSide(edge, agencyId) {
  const isSource = edge.agencyId === agencyId;
  if (edge.umbrellaDeptName && isSource) {
    return { kind: "dept", name: edge.umbrellaDeptName, direction: "up" };
  }
  const agency = isSource ? props.data.agencies?.[edge.relatedAgencyId] : props.data.agencies?.[edge.agencyId];
  let direction = "none";
  if (edge.type === "delegation") direction = isSource ? "out" : "in";
  return { kind: "agency", agency, direction };
}

function openAgencyModal(agency) {
  if (agency) openDetailModal("agencies", agency);
}

// --- Ego-graph: one agency plus only its direct connections. Small by
// construction (typically 2-6 nodes), so it stays legible without needing
// a physics layout — a plain ring made every relationship look identical
// (a neutral spoke to a circle), which read as "this agency is the source
// of everything around it" regardless of what the relationship actually
// was. Instead, position and draw each connection by what kind of
// authority it represents:
//   - organizational-parent: department sits ABOVE, arrow points up to it
//     (hierarchy, not a peer) — the one relationship never drawn as a
//     peer-level spoke.
//   - delegation: arrow points from whichever side actually delegates to
//     whichever side enforces, positioned to the sides.
//   - jurisdiction-split / overlapping: genuinely symmetric relationships
//     between peers — plain line, no arrowhead, positioned below.
//
// Every card uses the same fixed canvas — header/graph/footer all sized
// once, not computed per agency. A prior per-agency variable-height
// version added real complexity without actually working (grid rows still
// stretched to the tallest neighbor, and the fixed top margin was too
// tight, clipping department nodes at the top edge).
const EGO_SIZE = 300;
const EGO_HEIGHT = 320;
const CENTER_X = EGO_SIZE / 2;
const CENTER_Y = 230;
const DEPT_Y = 40;
const PEER_RADIUS = 105;

// SVG <text> doesn't auto-wrap. Every node label — agency names too, not
// just department names — needs manual wrapping onto tspans, otherwise a
// long single-line label (e.g. "US Customs and Border Protection", "State
// & Local Agencies") renders far wider than its own node and can visually
// bleed into a neighboring row (this is what caused the "top node overlaps
// the row below" symptom — it was never a spacing/distance problem, it was
// unwrapped text extending sideways past its own lane).
function wrapLabel(text, maxCharsPerLine = 20) {
  const words = (text || "").split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Department node labels use the shortened form ("Health and Human
// Services (HHS)" rather than "US Department of Health and Human Services
// (HHS)") — every umbrellaDeptName in this dataset shares the same "US
// Department of ..." prefix, which is redundant once it's already drawn as
// a department-tier node, and dropping it is what keeps these labels to a
// wrappable 2-3 lines instead of 4-5.
function shortDeptLabel(name) {
  return (name || "").replace(/^US Department of( the)?\s*/i, "").trim() || name;
}

function egoNodesFor(agencyId) {
  const seen = new Map();
  for (const group of edgesByTypeFor(agencyId)) {
    for (const edge of group.edges) {
      const side = otherSide(edge, agencyId);
      const key = side.kind === "agency" ? side.agency?.id : `dept:${side.name}`;
      if (key && !seen.has(key)) seen.set(key, { ...side, type: edge.type });
    }
  }
  const all = [...seen.values()];
  const depts = all.filter((n) => n.kind === "dept");
  const peers = all.filter((n) => n.kind !== "dept");

  const deptNodes = depts.map((n, i) => ({
    ...n,
    x: CENTER_X + (i - (depts.length - 1) / 2) * 130,
    y: DEPT_Y,
  }));

  // Peers fan out across most of the lower circle (170°-370°, i.e. just
  // past directly-left through just past directly-right) rather than a
  // full ring or the previous narrower 200°-340° arc — the narrower arc
  // packed nodes too tightly at the two ends when an agency (e.g. FDA) has
  // several peers, causing labels to overlap. Still reserves "above"
  // exclusively for organizational hierarchy.
  const arcStart = Math.PI * (170 / 180);
  const arcEnd = Math.PI * (370 / 180);
  const peerNodes = peers.map((n, i) => {
    const t = peers.length > 1 ? i / (peers.length - 1) : 0.5;
    const angle = arcStart + t * (arcEnd - arcStart);
    return {
      ...n,
      x: CENTER_X + PEER_RADIUS * Math.cos(angle),
      y: CENTER_Y + PEER_RADIUS * Math.sin(angle) * 0.9,
    };
  });

  return [...deptNodes, ...peerNodes];
}

const agencyEgoGraphs = computed(() =>
  agencyOptions.value.map((agency) => ({
    agency,
    nodes: egoNodesFor(agency.id),
  }))
);
</script>

<template>
  <div class="view-header-card">
    <h2 class="flow-view__title">Agency Graphs</h2>
  </div>

  <div class="jurisdiction-ego-grid">
    <div v-for="entry in agencyEgoGraphs" :key="entry.agency.id" class="jurisdiction-ego-cell">
      <h3 class="jurisdiction-ego-cell__title">
        <button type="button" class="jurisdiction-detail__title" @click="openAgencyModal(entry.agency)">
          {{ entry.agency.name }}
        </button>
        <span v-if="entry.agency.founded" class="jurisdiction-ego-cell__founded">est. {{ entry.agency.founded }}</span>
      </h3>

      <!-- Render the agency alone (center node, no connections) rather than
           falling back to bare text when an agency has no recorded edges
           (e.g. GS1/GFSI are private standards bodies with no jurisdiction
           relationships in this dataset) — keeps every card the same shape. -->
      <svg class="jurisdiction-ego" :viewBox="`0 0 ${EGO_SIZE} ${EGO_HEIGHT}`">
        <defs>
          <marker :id="`ego-arrow-parent-${entry.agency.id}`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="jurisdiction-ego__arrowhead jurisdiction-ego__arrowhead--parent" />
          </marker>
          <marker :id="`ego-arrow-delegation-${entry.agency.id}`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="jurisdiction-ego__arrowhead jurisdiction-ego__arrowhead--delegation" />
          </marker>
        </defs>

        <line
          v-for="node in entry.nodes"
          :key="`line-${node.kind}-${node.agency?.id || node.name}`"
          class="jurisdiction-ego__link"
          :class="`jurisdiction-ego__link--${node.type}`"
          :style="{
            markerEnd: node.direction === 'up' ? `url(#ego-arrow-parent-${entry.agency.id})` : node.direction === 'out' ? `url(#ego-arrow-delegation-${entry.agency.id})` : null,
            markerStart: node.direction === 'in' ? `url(#ego-arrow-delegation-${entry.agency.id})` : null,
          }"
          :x1="CENTER_X"
          :y1="CENTER_Y"
          :x2="node.x"
          :y2="node.y"
        />
        <g class="jurisdiction-ego__center-node">
          <circle :cx="CENTER_X" :cy="CENTER_Y" r="26" />
          <text :x="CENTER_X" :y="CENTER_Y + 4 - (wrapLabel(entry.agency.name).length - 1) * 5.5">
            <tspan v-for="(line, i) in wrapLabel(entry.agency.name)" :key="i" :x="CENTER_X" :dy="i === 0 ? 0 : 11">{{ line }}</tspan>
          </text>
        </g>
        <g
          v-for="node in entry.nodes"
          :key="`node-${node.kind}-${node.agency?.id || node.name}`"
          class="jurisdiction-ego__node"
          :class="{ 'jurisdiction-ego__node--clickable': node.kind === 'agency' }"
          :transform="`translate(${node.x}, ${node.y})`"
          @click="node.kind === 'agency' && openAgencyModal(node.agency)"
        >
          <circle r="20" />
          <title v-if="node.kind === 'dept'">{{ node.name }}</title>
          <text :y="4 - (wrapLabel(node.kind === 'agency' ? node.agency?.name : shortDeptLabel(node.name)).length - 1) * 5.5">
            <tspan
              v-for="(line, i) in wrapLabel(node.kind === 'agency' ? node.agency?.name : shortDeptLabel(node.name))"
              :key="i"
              x="0"
              :dy="i === 0 ? 0 : 11"
            >{{ line }}</tspan>
          </text>
        </g>
      </svg>

      <!-- Fixed-height footer slot on every card — kept per-card (not once
           at the page bottom) so the key stays in view no matter how far
           down this grid the user has scrolled. When there's nothing to
           decode (no edges on this card, e.g. GS1/GFSI), the same slot
           holds a one-line note instead of the key, so every card's total
           height stays identical rather than the empty-note cards coming
           out shorter than the rest. -->
      <div class="jurisdiction-ego__key">
        <template v-if="entry.nodes.length">
          <span><span class="jurisdiction-ego__key-swatch jurisdiction-ego__key-swatch--parent"></span>Parent dept</span>
          <span><span class="jurisdiction-ego__key-swatch jurisdiction-ego__key-swatch--delegation"></span>Delegation</span>
          <span><span class="jurisdiction-ego__key-swatch jurisdiction-ego__key-swatch--peer"></span>Split/overlap</span>
        </template>
        <span v-else class="jurisdiction-ego-cell__empty-note">No government jurisdiction relationships apply.</span>
      </div>
    </div>
  </div>
</template>
