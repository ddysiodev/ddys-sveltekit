<script lang="ts">
  import type { DdysMovie } from '../types/ddys.js';
  import { movieDescription, moviePoster, movieTitle } from '../utils/display.js';
  export let movie: DdysMovie;
  export let imageFallback = '/ddys-sveltekit/images/logo.png';
  $: title = movieTitle(movie);
  $: poster = moviePoster(movie, imageFallback);
  $: description = movieDescription(movie);
</script>

<article class="ddys-detail">
  <div class="ddys-detail__poster"><img src={poster} alt={title} /></div>
  <div class="ddys-detail__body">
    <h1>{title}</h1>
    <div class="ddys-detail__meta">
      {#if movie.year}<span>{movie.year}</span>{/if}
      {#if movie.type}<span>{movie.type}</span>{/if}
      {#if movie.genre}<span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>{/if}
      {#if movie.region}<span>{Array.isArray(movie.region) ? movie.region.join(', ') : movie.region}</span>{/if}
    </div>
    {#if description}<p>{description}</p>{/if}
  </div>
</article>
