const FILE_ID = "1rQOmjKpl6xGzLOYTZJRZSI8qjZf9HVBZ";

export async function GET() {
  const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

  const response = await fetch(url, {
    redirect: "follow",
    cache: "no-store"
  });

  if (!response.ok) {
    return new Response("Não foi possível carregar o mockup.", {
      status: 502
    });
  }

  const bytes = await response.arrayBuffer();
  const contentType =
    response.headers.get("content-type") || "image/png";

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600"
    }
  });
}
