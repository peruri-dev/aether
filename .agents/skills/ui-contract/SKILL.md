---
name: ui-contract
description: While editing frontend HTML, JSX or Vue templates, add missing business data-testid hooks using the team UI Contract. Inspect IDDS/custom-component forwarding, preserve existing IDs and flag proven contract gaps without silently changing them.
---

<!--
Sumber: skill developer UI Contract tim QA (Confluence TEST, "SKILL.MD", page 1269301286)
dan kebijakan "011. UI Contract untuk Locator Semantik pada Pengujian Playwright" (page 1243545604).
Pemilik isi: tim QA. Tanggal sinkron terakhir: 2026-11-16.
Perubahan isi kebijakan dilakukan di Confluence lebih dulu, lalu disinkronkan ke sini
dengan commit `docs(skills): sync ui-contract`. Bagian "Aether" di bawah adalah tambahan
khusus boilerplate ini dan dipelihara oleh pengelola Aether.
-->

# UI Contract: FE and QA working from the same contract

## Purpose and scope

While actively developing a frontend, fill missing test hooks on the elements
being touched. Keep the existing fill-in-the-gap workflow: no whole-page audit,
compliant-rows report or automatic rewrite of tests. A review/audit happens only
when requested; in that mode report findings without editing.

Policy: https://digitalperuri.atlassian.net/wiki/spaces/TEST/pages/1243545604
IDDS reference: https://design.inadigital.go.id/

The policy defines business test-hook naming and tiers. IDDS defines component
APIs, semantics and interaction behavior. Read the installed component version,
types/source and repository guidance when needed; website examples do not prove
what the current application renders. If a reference cannot be accessed, use
the explicit rules below and disclose the unavailable version-specific evidence.

## Stable business identity

Use exactly three dot-separated segments by default:
`<page-or-flow>.<element>.<intent>`.

- Lowercase English; hyphens within a segment for multiword names.
- Page/flow: login, profile, user-management, document-upload.
- Element: button, input, select, checkbox, radio, alert, modal, table, row,
  card, tab, link, menu, item or text, matching the real target.
- Intent: submit, email, save, add-user, error, close-filter.
- Never encode styling, location, translated UI copy, framework/component name,
  state, environment, index or record-generated value.
- A business action remains `profile.button.save` across IDDS variants and copy
  changes. Do not name it `idds.button.primary`.
- Add hooks only to business actions, inputs, messages, values and containers
  needed for interaction/assertion. Skip decoration and layout-only wrappers.

## Locator and accessibility contract

1. getByTestId: preferred explicit contract for QA business flows.
2. getByRole: semantic/accessibility interactions and checks.
3. getByLabel: labelled form controls.
4. getByText/getByAltText/getByTitle: when copy/alternative text is under test.
5. Stable CSS only when the higher contract is unavailable.
6. XPath last; never absolute.

Keep labels, native semantics, accessible names, keyboard behavior and focus
correct. A test ID is not accessibility. Do not replace an existing semantic
test or change UI copy/ARIA merely to add a business hook. A stable test ID
does not prove disabled, selected, error or successful state: QA asserts that
state separately. Do not add state to the test ID.

## Decide for each touched element

- **Existing valid ID/contract:** reuse and skip silently; do not list compliant
  elements or add a second ID because a test currently uses role/label.
- **Missing hook and clear business intent:** add the attribute using the
  repository's supported component API.
- **Existing ID with a proven defect:** retain its value and flag the specific
  duplicate, naming or forwarding defect briefly. Do not rename/remove it,
  migrate consumers or change semantics without an explicit coordinated change.
- **Contract entry exists but forwarding/rendering is unknown:** inspect it;
  neither claim implemented nor silently invent a different hook.
- **Ambiguous business intent:** inspect nearby callers/context first. Ask one
  focused question only if it remains unresolved.
- **Unsupported component hook:** report the exact component/version, target
  and missing API/forwarding evidence. Do not add an ineffective wrapper ID,
  bypass the component, patch node_modules or upgrade IDDS automatically.

Do not invent HTML, existing attributes, action names or runtime observations.

## IDDS and custom components

Before passing `data-testid`, `testId`, `inputProps` or similar, verify that exact
API exists and forwards to the intended DOM node. Do not assume React/Vue/
Vanilla variants or different IDDS versions have the same forwarding behavior.

FE owns business names at the call site. A shared component provides the
supported forwarding mechanism; it must not hardcode a product-specific ID
that duplicates across instances. Do not invent a wrapper or add testId props
to every component pre-emptively.

| Component                             | Intended contract target                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Button/icon action                    | The clickable button/link, not its icon or wrapper.                                                                            |
| Text/password/textarea/checkbox/radio | The actual editable/checkable control; preserve label association and name.                                                    |
| Modal/drawer                          | The dialog/container plus separately needed actions; retain focus/close behavior.                                              |
| Select/dropdown/date picker           | Identify the actual trigger/input and any panel/option/calendar controls QA needs; inspect portal placement and existing APIs. |
| Table/list/card                       | The stable item container, then the distinct business action within it.                                                        |
| Alert/toast/validation                | The actual message/state element relevant to the requirement.                                                                  |

Complex controls may expose several independently named hooks, each following
the same three-segment rule. Add only the required parts. Do not derive a new
public contract by concatenating arbitrary suffixes or exposing every internal
node. A portaled panel is not necessarily a descendant of its trigger; establish
the relationship from source/DOM, not a guessed locator chain.

Internal generated `id` values used for labels/ARIA can remain generated. They
are not stable business test IDs and must not be repurposed or overwritten.

## Repeated data and duplicate actions

Use one stable test ID per repeated item type. Expose an approved non-sensitive
business identity separately, e.g. data-user-id; do not bake it into data-testid.
Check whether that attribute already exists and is on the item or a descendant.

If the identity is on the same row, do not use filter({has: ...}) as though
it were a child. Example against an observed same-node attribute:

```typescript
const row = page
  .getByTestId('user-management.row.user')
  .and(page.locator('[data-user-id="123"]'));
await row.getByTestId('user-management.button.edit').click();
```

This is illustrative; do not claim the attribute or value exists without
evidence. A row identity alone does not distinguish two different actions in
that row. Resolve both record and action. Do not hide ambiguity with first/nth.
If no stable identity is available, flag the contract gap; use meaningful
observed row content only where it uniquely establishes the intended record.

## FE-QA collaboration and verification

FE applies the business hook through the supported component API; QA consumes
it and preserves scenario/assertion intent. IDDS maintainers own a missing
library-level forwarding/API capability. Do not modify a different repository
or issue a breaking migration as part of an unrelated local edit.

For a coordinated change, inspect affected consumers and include frontend/test
updates together in the normal review workflow. Repeated elements may share
IDs; uniqueness is required at the intended query scope, not globally for every
row or modal. Incompatible existing IDs need an explicit migration decision,
not an obsolete alias.

Check the touched scope with the tools available:

- Attribute reaches the intended rendered DOM node and does not duplicate there.
- Single-item selection matches one intended target; repeated records/actions
  can be distinguished without arbitrary positional selection.
- Relevant state, accessible name/label and keyboard/focus behavior remain intact.
- Run the affected component/frontend tests and QA scenario where available.

Source inspection can support a proposed edit but cannot prove live DOM or a
browser pass. Report unavailable checks once. Do not require a full business
test run for every attribute-only edit, or claim it passed without execution.

## Aether: shared components (`src/modules/common/components`)

In Aether the shared component library is `src/modules/common/components`, owned by
the Aether maintainers, not IDDS. The IDDS rules above still apply when a project
also uses IDDS packages.

- Write `data-testid` as a plain attribute at the call site:
  `<Button data-testid="profile.button.save">`. Do not add a `testId` prop to Aether
  primitives; they forward remaining props to their interactive DOM node.
- Verify forwarding before relying on it. Known cases that need care:
  - `Input`: the attribute must land on the `<input>`, not the wrapper `<div>`.
  - `TableCell` with `href`: QA clicks the `<a>`, not the `<td>`.
  - `showToast(...)` has no JSX call site; pass the hook through its `testId` option.
  - `Tooltip`: child props are cloned; check the trigger keeps its attribute.
- When porting or writing a primitive, forwarding `data-*` to the interactive node is
  part of the definition of done.
- A missing forwarding capability in `common` is an Aether gap: report it (component,
  target node, evidence) and fix it in `common` in its own change, not with a wrapper ID.

## Aether: component tests vs QA flows

The locator tiers above are for QA flows in Playwright (`tests/e2e/`).
Component and unit tests written by FE in Vitest + Testing Library prefer
`getByRole` and `getByLabel` first, because they prove accessible names and labels.
Use `getByTestId` there only for elements with no accessible role or name.

## Output

Default coding mode: make safe missing-hook additions, then give one concise
line per added hook. Skip compliant elements silently. Add a short blocker line
for a proven existing defect or unsupported forwarding; identify FE/QA/IDDS owner
and validation needed. Do not produce an inventory or a large audit report.

When everything touched is compliant or decorative, say so once and finish.
For explicitly requested review, report only scoped findings and evidence;
do not apply changes. A proposed name, source edit, rendered hook and verified
QA scenario are separate outcomes.

## Maintenance

Keep this developer skill, the canonical UI Contract document and the worker's
`skills/generate-ui-contract/SKILL.md` aligned on naming, scope and evidence.
Their modes differ: this skill can edit the FE code the developer is working on;
the worker's UI Contract report is recommendation-only. Do not copy its tool/
JSON/report obligations into this coding workflow. Changes are manually synced;
publishing this skill does not update the worker or installed team copies.
