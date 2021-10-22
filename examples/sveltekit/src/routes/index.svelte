<script lang="ts">
  import { api } from "$api/api.client";
  import type { Product } from "$api/api.models";

  import { onMount } from "svelte";
  import type { ApiError } from "typesafe-api-endpoints";

  onMount(async () => {
    const response = await api.GET("products", undefined);
    data = response.data;
    error = response.error;
  });

  let error: ApiError;
  let data: Product[];
</script>

<h1>Welcome to SvelteKit</h1>

{#if data}
  <ul>
    {#each data as { id, name, color }}
      <li>
        <em>{id}</em> <strong>{name} </strong>{color}
      </li>
    {/each}
  </ul>
{:else if error}
  Uups! {error}
{:else}
  ...loading
{/if}
