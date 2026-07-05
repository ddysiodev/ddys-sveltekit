<script lang="ts">
  import type { DdysMovie } from '../types/ddys.js';
  import { movieDescription, moviePoster, movieSlug, movieTitle } from '../utils/display.js';
  export let movie: DdysMovie;
  export let basePath = '/ddys';
  export let imageFallback = '/ddys-sveltekit/images/logo.png';
  export let linkTarget = '_self';
  $: title = movieTitle(movie);
  $: slug = movieSlug(movie);
  $: poster = moviePoster(movie, imageFallback);
  $: description = movieDescription(movie);
  $: href = slug ? `${basePath.replace(/\/+$/, '')}/movie/${encodeURIComponent(slug)}` : basePath;
</script>

<article class="ddys-card">
  <a class="ddys-card__poster" href={href} target={linkTarget} rel={linkTarget === '_blank' ? 'noreferrer' : undefined} aria-label={title}>
    <img src={poster} alt={title} loading="lazy" />
  </a>
  <div class="ddys-card__body">
    <a class="ddys-card__title" href={href} target={linkTarget} rel={linkTarget === '_blank' ? 'noreferrer' : undefined}>{title}</a>
    <div class="ddys-card__meta">
      {#if movie.year}<span>{movie.year}</span>{/if}
      {#if movie.type}<span>{movie.type}</span>{/if}
      {#if movie.region}<span>{Array.isArray(movie.region) ? movie.region.join(', ') : movie.region}</span>{/if}
    </div>
    {#if description}<p>{description}</p>{/if}
  </div>
</article>
