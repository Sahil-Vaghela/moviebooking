import citiesRaw from '../data/cities.json';
import genresRaw from '../data/genres.json';
import bannersRaw from '../data/banners.json';
import moviesRaw from '../data/movies.json';
import theatresRaw from '../data/theatres.json';
import screensRaw from '../data/screens.json';
import showsRaw from '../data/shows.json';
import type {
  Banner,
  City,
  FormatType,
  Genre,
  Movie,
  ReleaseStatus,
  Screen,
  Show,
  Theatre,
} from '../types/catalogue';

const cities = citiesRaw as City[];
const genres = genresRaw as Genre[];
const banners = bannersRaw as Banner[];
const movies = moviesRaw as Movie[];
const theatres = theatresRaw as Theatre[];
const screens = screensRaw as Screen[];
const shows = showsRaw as Show[];

const cityMap = new Map(cities.map((c) => [c.id, c]));
const genreMap = new Map(genres.map((g) => [g.id, g]));
const movieMap = new Map(movies.map((m) => [m.id, m]));
const theatreMap = new Map(theatres.map((t) => [t.id, t]));
const screenMap = new Map(screens.map((s) => [s.id, s]));
const showMap = new Map(shows.map((s) => [s.id, s]));

export interface MovieFilterParams {
  cityId?: string;
  query?: string;
  language?: string;
  genreId?: string;
  format?: FormatType | '';
  status?: ReleaseStatus | 'ALL';
}

export interface TheatreShowGroup {
  theatre: Theatre;
  shows: {
    show: Show;
    screen: Screen;
  }[];
}

export const catalogueService = {
  getCities(): City[] {
    return cities;
  },

  getCityById(cityId: string): City | undefined {
    return cityMap.get(cityId);
  },

  getDefaultCity(): City {
    return cities[0];
  },

  getGenres(): Genre[] {
    return genres;
  },

  getGenreById(genreId: string): Genre | undefined {
    return genreMap.get(genreId);
  },

  getGenresForMovie(movie: Movie): Genre[] {
    return movie.genreIds
      .map((id) => genreMap.get(id))
      .filter((g): g is Genre => Boolean(g));
  },

  getBannersForCity(cityId: string): Banner[] {
    return banners.filter((b) => b.cityIds.includes(cityId));
  },

  getAllMovies(): Movie[] {
    return movies;
  },

  getMovieById(movieId: string): Movie | undefined {
    return movieMap.get(movieId);
  },

  getMoviesByCity(cityId: string, status?: ReleaseStatus): Movie[] {
    return movies.filter((m) => {
      const inCity = m.cityIds.includes(cityId);
      const statusMatch = status ? m.status === status : true;
      return inCity && statusMatch;
    });
  },

  filterMovies(params: MovieFilterParams): Movie[] {
    const q = (params.query ?? '').trim().toLowerCase();
    return movies.filter((movie) => {
      if (params.cityId && !movie.cityIds.includes(params.cityId)) {
        return false;
      }
      if (params.status && params.status !== 'ALL' && movie.status !== params.status) {
        return false;
      }
      if (params.language && !movie.languages.includes(params.language)) {
        return false;
      }
      if (params.genreId && !movie.genreIds.includes(params.genreId)) {
        return false;
      }
      if (params.format && !movie.formats.includes(params.format)) {
        return false;
      }
      if (q) {
        const movieGenres = this.getGenresForMovie(movie)
          .map((g) => g.name.toLowerCase())
          .join(' ');
        const haystack = [
          movie.title,
          movie.tagline,
          movie.director,
          movie.languages.join(' '),
          movieGenres,
          movie.cast.map((c) => c.name).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });
  },

  getAvailableLanguagesForCity(cityId: string): string[] {
    const langSet = new Set<string>();
    this.getMoviesByCity(cityId).forEach((m) => m.languages.forEach((l) => langSet.add(l)));
    return Array.from(langSet).sort();
  },

  getAvailableFormatsForCity(cityId: string): FormatType[] {
    const formatSet = new Set<FormatType>();
    this.getMoviesByCity(cityId).forEach((m) => m.formats.forEach((f) => formatSet.add(f)));
    return Array.from(formatSet);
  },

  getTheatresByCity(cityId: string): Theatre[] {
    return theatres.filter((t) => t.cityId === cityId);
  },

  getTheatreById(theatreId: string): Theatre | undefined {
    return theatreMap.get(theatreId);
  },

  getScreenById(screenId: string): Screen | undefined {
    return screenMap.get(screenId);
  },

  getShowById(showId: string): Show | undefined {
    return showMap.get(showId);
  },

  getShowContext(showId: string): {
    show: Show;
    movie: Movie;
    theatre: Theatre;
    screen: Screen;
    city: City;
  } | null {
    const show = showMap.get(showId);
    if (!show) return null;
    const movie = movieMap.get(show.movieId);
    const theatre = theatreMap.get(show.theatreId);
    const screen = screenMap.get(show.screenId);
    const city = cityMap.get(show.cityId);
    if (!movie || !theatre || !screen || !city) return null;
    return { show, movie, theatre, screen, city };
  },

  getGroupedShowsForMovie(params: {
    movieId: string;
    cityId: string;
    dateOffsetDays: number;
    language?: string;
    format?: FormatType | '';
    timeBand?: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  }): TheatreShowGroup[] {
    const matchingShows = shows.filter((show) => {
      if (show.movieId !== params.movieId) return false;
      if (show.cityId !== params.cityId) return false;
      if (show.dateOffsetDays !== params.dateOffsetDays) return false;
      if (params.language && show.language !== params.language) return false;
      if (params.format && show.format !== params.format) return false;

      if (params.timeBand && params.timeBand !== 'ALL') {
        const hour = parseInt(show.startTime.split(':')[0], 10);
        if (params.timeBand === 'MORNING' && hour >= 12) return false;
        if (params.timeBand === 'AFTERNOON' && (hour < 12 || hour >= 16)) return false;
        if (params.timeBand === 'EVENING' && (hour < 16 || hour >= 20)) return false;
        if (params.timeBand === 'NIGHT' && hour < 20) return false;
      }

      return true;
    });

    const grouped = new Map<string, TheatreShowGroup>();

    matchingShows.forEach((show) => {
      const theatre = theatreMap.get(show.theatreId);
      const screen = screenMap.get(show.screenId);
      if (!theatre || !screen) return;

      const existing = grouped.get(theatre.id);
      if (existing) {
        existing.shows.push({ show, screen });
      } else {
        grouped.set(theatre.id, {
          theatre,
          shows: [{ show, screen }],
        });
      }
    });

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      shows: group.shows.sort((a, b) => a.show.startTime.localeCompare(b.show.startTime)),
    }));
  },
};
