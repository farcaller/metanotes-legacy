id: 01F7VEAYH34TC9E2ENAYKVW01T
title: $:ui/scribbles/open
---

<TextInput label="search" bind="query" />
<Query query="Get-Scribbles | With-Title '${query}'" bind="results" />
<For values="results" bind="result">
* <$result>
</For>
