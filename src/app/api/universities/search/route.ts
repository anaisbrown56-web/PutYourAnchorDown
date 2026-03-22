import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALL_UNIVERSITIES = [
  'Auburn University', 'Boston College', 'Boston University',
  'Brigham Young University', 'Brown University', 'Carnegie Mellon University',
  'Case Western Reserve University', 'Clemson University', 'Columbia University',
  'Cornell University', 'Dartmouth College', 'Duke University',
  'Emory University', 'Florida State University', 'Fordham University',
  'George Washington University', 'Georgetown University',
  'Georgia Institute of Technology', 'Harvard University', 'Indiana University',
  'Johns Hopkins University', 'Louisiana State University',
  'Massachusetts Institute of Technology', 'Miami University',
  'Michigan State University', 'New York University',
  'North Carolina State University', 'Northeastern University',
  'Northwestern University', 'Ohio State University', 'Penn State University',
  'Princeton University', 'Purdue University', 'Rice University',
  'Rutgers University', 'Stanford University', 'Syracuse University',
  'Temple University', 'Texas A&M University', 'Tulane University',
  'UC Berkeley', 'UC Davis', 'UC Irvine', 'UC Los Angeles', 'UC San Diego',
  'UC Santa Barbara', 'University of Alabama', 'University of Arizona',
  'University of Chicago', 'University of Colorado Boulder',
  'University of Connecticut', 'University of Florida', 'University of Georgia',
  'University of Illinois Urbana-Champaign', 'University of Iowa',
  'University of Kansas', 'University of Kentucky', 'University of Maryland',
  'University of Massachusetts Amherst', 'University of Miami',
  'University of Michigan', 'University of Minnesota', 'University of Missouri',
  'University of North Carolina', 'University of Notre Dame',
  'University of Oregon', 'University of Pennsylvania',
  'University of Pittsburgh', 'University of Rochester',
  'University of South Carolina', 'University of Southern California',
  'University of Tennessee', 'University of Texas at Austin',
  'University of Utah', 'University of Virginia', 'University of Washington',
  'University of Wisconsin-Madison', 'Vanderbilt University',
  'Villanova University', 'Virginia Tech', 'Wake Forest University',
  'Washington University in St. Louis', 'Yale University',
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() || ''

  try {
    // Get universities from existing posts
    const locations = await prisma.location.findMany({
      where: { university: { not: '' } },
      select: { university: true },
      distinct: ['university'],
    })
    const postedUniversities = locations.map(l => l.university)

    // Merge and filter by search query
    const all = Array.from(new Set([...postedUniversities, ...ALL_UNIVERSITIES]))
    const filtered = all
      .filter(u => u.toLowerCase().includes(q))
      .sort()
      .slice(0, 10)
      .map(name => ({
        name,
        lat: 38.03,
        lng: -78.50,
        source: 'local' as const,
      }))

    return NextResponse.json(filtered)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}