// pages/api/user.js
export default async function handler(req, res) {
  const { token } = req.headers; // or req.cookies, wherever you're storing it

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const wpRes = await fetch(
      process.env.NEXT_PUBLIC_URL + "/wp-json/wp/v2/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await wpRes.json();
    return res.status(wpRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong", details: err });
  }
}
