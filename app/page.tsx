'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  totalDuration: number
  layovers: { airport: string; duration: number }[]
}

export default function FlightSearch() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flights?from=${from}&to=${to}&date=${date}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setConnections(data)
      if (data.length === 0) {
        setError('No flights found for the given route and date.')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(`An error occurred while fetching flight data`)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AYCF Flight Connection Finder</h1>
        <Card className="mb-8 ">
            <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
            <CardDescription className="max-w-2xl">
              <div>This is very experimental and data is manually updated from external sources. </div>
              <div>95% percent of this website was AI generated. It should be accurate but double check with the Multipass site. 🤷‍♂️</div>

              <div className="font-bold">Last availability data update: 01/07/2024 ~7:00 CET</div>

              <div className="font-bold mt-3">Also don&apos;t book flights with &lt;3 hour layover. You will miss your flight.</div>
              <div className="mt-3">
              Known issues:
                <ul className="list-disc">
                    <li>Flight durations are inaccurate (Caravelo still haven&apos;t fixed them on the multipass site)</li>
                </ul>
              </div>
            </CardDescription>
            </CardHeader>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle>Search for Flights</CardTitle>
          <CardDescription>Enter your departure and arrival airports, and travel date.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="Departure Airport (e.g. LTN)"
                  value={from}
                  onChange={(e) => setFrom(e.target.value.toUpperCase())}
                  required
                  minLength={3}
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="Arrival Airport (e.g. MLE)"
                  value={to}
                  onChange={(e) => setTo(e.target.value.toUpperCase())}
                  required
                  minLength={3}
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  // Max in 3 days
                  max={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {connections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Available Connections (max 2 stop-overs) ({connections.length})</h2>
          {connections.map((connection, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>Connection {index + 1}</CardTitle>
                <CardDescription>
                  Total Duration: {formatDuration(connection.totalDuration)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connection.flights.map((flight, flightIndex) => (
                  <div key={flightIndex} className="mb-4 p-4 bg-gray-50 rounded-md">
                    <p className="font-semibold">Flight {flightIndex + 1}:</p>
                    <p>Date: {flight.date}</p>
                    <p>From: {flight.from} to {flight.to}</p>
                    <p>Takeoff: {flight.takeoff} | Landing: {flight.landing}</p>
                    <p>Duration: {flight.duration}</p>
                    <p>Price: {flight.price}</p>
                    {connection.layovers[flightIndex] && (
                      <p className="mt-2 text-sm text-gray-600">
                        Layover in {connection.layovers[flightIndex].airport}:
                        {formatDuration(connection.layovers[flightIndex].duration)}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}