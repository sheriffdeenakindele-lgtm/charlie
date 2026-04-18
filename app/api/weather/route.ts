import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') ?? 'current'; // 'current' | 'forecast'

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENWEATHERMAP_API_KEY not configured' },
      { status: 503 }
    );
  }

  try {
    const base = 'https://api.openweathermap.org/data/2.5';
    const url =
      type === 'forecast'
        // cnt=9 → 9 × 3h = 27 h, enough to cover the next full day
        ? `${base}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=9`
        : `${base}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url, {
      next: { revalidate: 300 }, // cache on the server for 5 min
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || 'OpenWeatherMap error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OWM fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
