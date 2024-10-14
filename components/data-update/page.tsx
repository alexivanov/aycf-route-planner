"use client";

import { FunctionComponent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const DataUpdatePage: FunctionComponent = () => {
  const [auth, setAuth] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);

  const handleDataUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fileUrl", fileUrl);
      const response = await fetch(`/api/data-update`, {
        method: "POST",
        headers: {
          Authorization: auth,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }
      const data = await response.text();

      setResponse(data);
    } catch (err) {
      console.error("Error:", err);
      setResponse(`Error: ${(err as NodeJS.ErrnoException).message} ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Return Journey Finder</h1>
      <Card>
        <CardHeader>
          <CardTitle>Data update</CardTitle>
          <CardDescription>Update the flights data</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDataUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                type="text"
                required
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth">Authorization</Label>
              <Input
                id="auth"
                type="password"
                required
                onChange={(e) => setAuth(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Data"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <div className="mt-4 p-4 bg-gray-100 text-gray-700 rounded-md">
          {response}
        </div>
      )}
    </div>
  );
};
