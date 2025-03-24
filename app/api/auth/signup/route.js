export async function POST(req) {
  return new Response(
    JSON.stringify({
      message: "Signup handled on client side via Firebase Auth.",
    }),
    { status: 200 }
  );
}
