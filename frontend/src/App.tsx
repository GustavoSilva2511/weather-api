import { useState, type FormEvent } from 'react';

interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

function kelvinToCelsius(value: number) {
  return Math.round(value - 273.15);
}

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError('Informe o nome de uma cidade.');
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const response = await fetch(`/api/weather/${encodeURIComponent(trimmedCity)}`);

      if (!response.ok) {
        throw new Error('Não foi possível buscar o clima para essa cidade.');
      }

      setWeather((await response.json()) as WeatherResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <span className="badge">Weather API</span>
          <h1>Como está o tempo?</h1>
          <p>Busque as condições atuais de qualquer cidade do mundo.</p>
        </header>

        <form className="search" onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ex.: São Paulo, London, Tokyo"
            aria-label="Nome da cidade"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <article className="result">
            <div className="location">
              <h2>
                {weather.name}
                <span>{weather.sys.country}</span>
              </h2>
              <p>{weather.weather[0]?.description}</p>
            </div>

            <div className="temperature">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@2x.png`}
                alt={weather.weather[0]?.description}
              />
              <strong>{kelvinToCelsius(weather.main.temp)}°C</strong>
            </div>

            <dl className="details">
              <div>
                <dt>Sensação</dt>
                <dd>{kelvinToCelsius(weather.main.feels_like)}°C</dd>
              </div>
              <div>
                <dt>Umidade</dt>
                <dd>{weather.main.humidity}%</dd>
              </div>
              <div>
                <dt>Vento</dt>
                <dd>{Math.round(weather.wind.speed * 3.6)} km/h</dd>
              </div>
            </dl>
          </article>
        )}
      </section>
    </main>
  );
}
