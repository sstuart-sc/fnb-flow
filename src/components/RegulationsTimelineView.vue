<script setup>
import { computed, ref } from "vue";
import { openDetailModal } from "../composables/useModals";

const props = defineProps({
  data: { type: Object, required: true },
});

// Small fixed categorical palette, cycled by index — this app has no
// existing per-agency color set (only 4 fixed thread colors), and 12
// agencies is few enough that a cycled palette reads fine.
const AGENCY_COLORS = [
  "#2f6b4f", "#2e6f8e", "#b23b3b", "#a8781f",
  "#6a4c93", "#c9622a", "#3c8f6b", "#7a5230",
  "#4a5fae", "#a83e6c", "#5c8a2f", "#8a5c5c",
];

const regulations = computed(() => Object.values(props.data.regulations || {}));

// Position on the axis uses complianceDeadline when present (proposed/
// future rules), otherwise the enactment year — this keeps not-yet-binding
// rules positioned by when they'll actually matter rather than when they
// were merely proposed.
function yearOf(reg) {
  if (reg.complianceDeadline) return new Date(reg.complianceDeadline).getFullYear();
  return reg.year;
}

// A strict linear year scale crowds this dataset badly: most regulations
// cluster into a few bursts (1995-2016 especially), so a metrically-accurate
// axis leaves huge blank stretches over the sparse decades and crushes the
// dense years into overlapping blobs. Instead, position by RANK among the
// distinct years actually present — every distinct year gets an equal share
// of vertical space regardless of how much real time separates it from its
// neighbors. The axis is still labeled with the true year, it's just no
// longer a proportional ruler.
const distinctYears = computed(() => {
  const years = new Set(regulations.value.map(yearOf).filter((y) => Number.isFinite(y)));
  return [...years].sort((a, b) => a - b);
});

const rankByYear = computed(() => {
  const map = new Map();
  distinctYears.value.forEach((y, i) => map.set(y, i));
  return map;
});

// Percent position for a given year, with a small margin so the first/last
// rows aren't flush against the chart edges.
function yPercentForYear(year) {
  const n = distinctYears.value.length;
  if (n <= 1) return 50;
  const rank = rankByYear.value.get(year) ?? 0;
  const margin = 4;
  return margin + (rank / (n - 1)) * (100 - margin * 2);
}

function yPercent(reg) {
  return yPercentForYear(yearOf(reg));
}

const agencyLanes = computed(() => {
  const byAgency = new Map();
  for (const reg of regulations.value) {
    const list = byAgency.get(reg.agencyId) || [];
    list.push(reg);
    byAgency.set(reg.agencyId, list);
  }
  return [...byAgency.entries()]
    .map(([agencyId, regs], i) => {
      const sorted = regs.sort((a, b) => yearOf(a) - yearOf(b));
      // Same-year (or same-rank) items in one agency's column would sit
      // exactly on top of each other — spread them horizontally within
      // the column instead of letting them collapse into one dot.
      const byYear = new Map();
      for (const reg of sorted) {
        const list = byYear.get(yearOf(reg)) || [];
        list.push(reg);
        byYear.set(yearOf(reg), list);
      }
      const positioned = [];
      for (const group of byYear.values()) {
        // Spread same-year items horizontally, but clamp the step so a
        // large cluster (FDA has 4 regs in 2015) can't push a dot past the
        // column's own edges — cap total spread to fit within ~110px of a
        // 130px-wide lane, centered on the lane rather than the dot's own
        // resting position.
        const maxSpreadRem = 6.5;
        const step = group.length > 1 ? Math.min(1.1, maxSpreadRem / (group.length - 1)) : 0;
        group.forEach((reg, j) => {
          const spread = group.length > 1 ? (j - (group.length - 1) / 2) * step : 0;
          positioned.push({ reg, xOffsetRem: spread });
        });
      }
      return {
        agencyId,
        agency: props.data.agencies?.[agencyId],
        color: AGENCY_COLORS[i % AGENCY_COLORS.length],
        regulations: positioned,
      };
    })
    .sort((a, b) => (a.agency?.name || "").localeCompare(b.agency?.name || ""));
});

// One gridline/label per distinct year present, rather than a computed
// evenly-numeric step — the axis is rank-based, not metric, so ticks only
// make sense at years that actually occur in the data.
const axisYears = computed(() => distinctYears.value);

function onDotClick(reg) {
  openDetailModal("regulations", reg);
}

function onAgencyClick(agency) {
  if (agency) openDetailModal("agencies", agency);
}
</script>

<template>
  <div class="view-header-card">
    <h2 class="flow-view__title">Regulations Timeline ({{ regulations.length }})</h2>
    <p class="flow-view__summary">
      Every regulation plotted by enactment year (or compliance deadline), grouped by
      the agency that issued it.
    </p>
  </div>

  <div class="timeline">
    <!-- Tablet/desktop: time runs top-to-bottom on the left, agencies are
         columns across the top — year labels get their own row each (no
         squished shared horizontal strip), agency names get a header cell
         that can wrap instead of a fixed-width side label. Header labels
         open the agency's own detail modal. -->
    <div class="timeline__scroll timeline__chart">
      <div class="timeline__scroll-inner" :style="{ '--timeline-year-count': distinctYears.length }">
        <div class="timeline__lane-header">
          <div class="timeline__axis-spacer"></div>
          <button
            v-for="lane in agencyLanes"
            :key="lane.agencyId"
            type="button"
            class="timeline__lane-label timeline__lane-label--clickable"
            @click="onAgencyClick(lane.agency)"
          >
            <span class="timeline__swatch" :style="{ background: lane.color }"></span>
            {{ lane.agency?.name || "Unknown agency" }}
          </button>
        </div>

        <div class="timeline__body">
          <div class="timeline__axis">
            <span
              v-for="y in axisYears"
              :key="y"
              class="timeline__axis-tick"
              :style="{ top: `${yPercentForYear(y)}%` }"
            >{{ y }}</span>
          </div>

          <div class="timeline__lanes">
            <div
              v-for="lane in agencyLanes"
              :key="lane.agencyId"
              class="timeline__lane-track"
            >
              <button
                v-for="{ reg, xOffsetRem } in lane.regulations"
                :key="reg.id"
                type="button"
                class="timeline__dot"
                :style="{ top: `${yPercent(reg)}%`, left: `calc(50% + ${xOffsetRem}rem)`, background: lane.color }"
                :title="`${reg.name} (${yearOf(reg)})`"
                @click="onDotClick(reg)"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phone width: no room for a legible horizontal axis at any scroll width,
         so drop the chart entirely and list regulations grouped by agency. -->
    <div class="timeline__list">
      <div v-for="lane in agencyLanes" :key="lane.agencyId" class="timeline__list-group">
        <button type="button" class="timeline__list-heading" @click="onAgencyClick(lane.agency)">
          <span class="timeline__swatch" :style="{ background: lane.color }"></span>
          {{ lane.agency?.name || "Unknown agency" }}
        </button>
        <button
          v-for="{ reg } in lane.regulations"
          :key="reg.id"
          type="button"
          class="timeline__list-row"
          @click="onDotClick(reg)"
        >
          <span class="timeline__list-year">{{ yearOf(reg) }}</span>
          <span class="timeline__list-name">{{ reg.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
