const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const locations = await prisma.location.findMany({ where: { latitude: null } })
  console.log('Found', locations.length, 'locations to geocode')
  
  for (const loc of locations) {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(loc.address) + '&limit=1'
    const res = await fetch(url, { headers: { 'User-Agent': 'PutYourAnchorDown/1.0' } })
    const data = await res.json()
    
    if (data && data.length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }
      })
      console.log('Geocoded:', loc.name, '->', data[0].lat, data[0].lon)
    } else {
      console.log('Could not geocode:', loc.name, loc.address)
    }
    
    await new Promise(r => setTimeout(r, 1000))
  }
  
  await prisma.$disconnect()
}

main()