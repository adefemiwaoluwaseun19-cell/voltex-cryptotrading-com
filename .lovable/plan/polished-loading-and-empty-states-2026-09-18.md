# Polished loading and empty states

## Goal
Make markets, portfolio, and asset charts feel responsive and intentional while live data is loading, unavailable, or absent.

## Changes
- Add reusable exchange-style skeleton primitives for price rows, balances, allocation bars, and charts.
- Give placeholders a restrained animated market sweep and staggered entrance, with reduced-motion support.
- Markets: show structured row skeletons during the first live-price request; replace the plain no-results line with a polished search/filter empty state.
- Portfolio: switch totals and holdings to the live portfolio hook, show matching balance/allocation/row skeletons during initial loading, and add dedicated empty holdings and activity states.
- Coin charts: show a chart-shaped animated placeholder while history loads, preserve existing data during refreshes, and show a clear unavailable state only when no chart data can be displayed.
- Keep existing live fallback behavior and navigation unchanged.

## Technical details
- Extend live hooks to expose initial-loading state separately from background refresh state.
- Add small shared presentation components rather than duplicating placeholder markup.
- Use existing semantic color tokens and motion timing; no new data source or backend work.
- Verify route metadata remains complete and the preview compiles after the changes.
