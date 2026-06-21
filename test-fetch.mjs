const apiKey = "re_6uSQtRqb_DSFDaNUH8UdbiaAhNpW9SGqV";

async function test() {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: "ahpatil0102@gmail.com",
        subject: "Test via Fetch",
        html: "<p>Hello world</p>"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();
