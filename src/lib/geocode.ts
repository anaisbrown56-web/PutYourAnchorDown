export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PutYourAnchorDown/1.0'
      }
    })
    const data = await res.json()
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      }
    }
    return null
  } catch {
    return null
  }
}