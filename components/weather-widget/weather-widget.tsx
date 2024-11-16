import { Airport, AirportLocationData } from "@/lib/types";
import { FunctionComponent, useEffect, useState } from "react";

import cx from "classnames";

export const WeatherWidget: FunctionComponent<{
  airport: Airport;
  viewport: "mobile" | "desktop";
}> = ({ airport, viewport }) => {
  const [locationData, setLocationData] = useState<AirportLocationData | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch airport location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(
          `/api/airport-location?iataCode=${airport.code}`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch airport location data: ${response.statusText}`,
          );
        }
        const data = await response.json();
        setLocationData(data);
      } catch (err) {
        setError("Failed to fetch airport location data");
        console.error("Error fetching airport location data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData().catch((err) => {
      console.error("Error fetching airport location data:", err);
      setError("Failed to fetch airport location data");
    });
  }, [airport.code]);

  useEffect(() => {
    if (!locationData) {
      return;
    }
  }, [locationData]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__TOMORROW__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__TOMORROW__.renderWidget();
  }
  if (loading) {
    return <div>Loading airport location data...</div>;
  }

  if (error || !locationData) {
    return <div className="text-red-500">Error loading weather data</div>;
  }

  return (
    <div
      className={cx("tomorrow pb-6 max-w[70%]", {
        "md:hidden": viewport === "mobile",
        "hidden md:block": viewport === "desktop",
      })}
      data-language="EN"
      data-latitude={locationData.latitude}
      data-longitude={locationData.longitude}
      data-unit-system="METRIC"
      data-skin="light"
      data-widget-type="upcoming"
      style={{
        position: "relative",
      }}
    ></div>
  );
};
