import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

interface Flight {
  date: string
  takeoff: string
  landing: string
  duration: string
  from: string
  to: string
  price: string
}

interface Connection {
  flights: Flight[]
  totalPrice: number
  totalDuration: number
  layovers: { airport: string; duration: number }[]
}

async function loadFlightData(): Promise<string> {
  const filePath = path.join(process.cwd(), 'data/flight-data.txt')
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return data
  } catch (error) {
    console.error('Error reading flight data file:', error)
    throw new Error('Failed to load flight data')
  }
}

function parseFlights(data: string): Flight[] {
  const flights: Flight[] = []
    const alLines = data.split('\n').map((line) => line.trim())

  // Find the first line of flight data, it will start with 'Date:'

  const firstFlightIndex = alLines.findIndex((line) => line.startsWith('Date:'))
    const lines = alLines.slice(firstFlightIndex)


    for (let i = 0; i < lines.length; i += 8) {
      if (lines[i].startsWith('Date:')) {
        const date = lines[i].split(': ')[1]
        const takeoff = lines[i + 1].split(': ')[1]
        const landing = lines[i + 2].split(': ')[1]
        const duration = lines[i + 3].split(': ')[1]
        const from = lines[i + 4].split(': ')[1].split(' ')[0]
        const to = lines[i + 5].split(': ')[1].split(' ')[0]
        const price = lines[i + 6].split(': ')[1]
        flights.push({ date, takeoff, landing, duration, from, to, price })
      } else {
        console.error('Invalid flight data format')
      }
    }

  return flights
}

const landsNextDay = (flight: Flight) => {
  const departure = new Date(`${flight.date} ${flight.takeoff}`)
  const landing = new Date(`${flight.date} ${flight.landing}`)
  return departure.getTime() > landing.getTime()
}


const getArrivalTime = (flight: Flight): Date => {
    const arrival = new Date(`${flight.date} ${flight.landing}`)
    if (landsNextDay(flight)) {
        arrival.setDate(arrival.getDate() + 1)
    }
    return arrival
}


function findConnections(flights: Flight[], from: string, to: string, date: string): Connection[] {
  const connections: Connection[] = []
  const maxStops = 3 // Limit to 2 stops (3 flights max)

  function dfs(current: string, path: Flight[], totalPrice: number, stops: number, visited = new Set<string>()) {
    if (stops > maxStops) return

    if (current === to) {
      const layovers = calculateLayovers(path)
      const totalDuration = calculateTotalDuration(path) + layovers.reduce((acc, layover) => acc + layover.duration, 0)
      connections.push({ flights: [...path], totalPrice, totalDuration, layovers })
      return
    }

    for (const flight of flights) {
      if (flight.from === current && flight.date >= date && !visited.has(flight.to)) {
        const lastFlight = path[path.length - 1]
        if (!lastFlight || getArrivalTime(lastFlight).getTime() < new Date(`${flight.date} ${flight.takeoff}`).getTime()) {
          dfs(flight.to, [...path, flight], totalPrice + parseFloat(flight.price), stops + 1, new Set([...visited, flight.to]))
        }
      }
    }
  }

  dfs(from, [], 0, 0, new Set([from]))
  return connections
}

function calculateTotalDuration(flights: Flight[]): number {
  let totalMinutes = 0
  for (const flight of flights) {
    const [hours, minutes] = flight.duration.split(':').map(Number)
    totalMinutes += hours * 60 + minutes
  }
  return totalMinutes
}

function calculateLayovers(flights: Flight[]): { airport: string; duration: number }[] {
  const layovers = []
  for (let i = 0; i < flights.length - 1; i++) {
    const currentFlight = flights[i]
    const nextFlight = flights[i + 1]
    const layoverAirport = currentFlight.to
    const layoverStart = new Date(`${currentFlight.date} ${currentFlight.landing}`)
    const layoverEnd = new Date(`${nextFlight.date} ${nextFlight.takeoff}`)
    const duration = (layoverEnd.getTime() - layoverStart.getTime()) / (1000 * 60) // Duration in minutes
    layovers.push({ airport: layoverAirport, duration })
  }
  return layovers
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  if (!from || !to || !date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const flightData = await loadFlightData()
  const flights = parseFlights(flightData)

  const connections = findConnections(flights, from, to, date)


  // Sort connections by arrival time, keeping in mind that some flights may arrive the next day
    connections.sort((a, b) => {

        const aArrival = getArrivalTime(a.flights[a.flights.length - 1])
        const bArrival = getArrivalTime(b.flights[b.flights.length - 1])

        return aArrival.getTime() - bArrival.getTime()
    })

  return NextResponse.json(connections)
}
