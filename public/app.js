const $ = id => document.getElementById(id);
const names = { openai: "GPT / OpenAI", claude: "Claude / Anthropic", llama: "Llama / Meta" };
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
async function refreshHealth() {
  try {
    const data = await fetch("/api/health").then(r => r.json());
    $("health").textContent = "SYSTEM ONLINE";
    document.querySelectorAll(".seat").forEach((el, i) => {
      const provider = data.providers[i];
      el.querySelector(".state").textContent = provider.configured ? "● Configured" : "○ Not configured";
      el.querySelector(".state").style.color = provider.configured ? "#65e3e0" : "#93a4bd";
    });
  } catch { $("health").textContent = "SERVER UNAVAILABLE"; }
}
function card(title, text, meta = "") {
  return `<article class="result"><h3>${escapeHtml(title)}</h3>${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}<pre>${escapeHtml(text)}</pre></article>`;
}
$("run").addEventListener("click", async () => {
  const prompt = $("prompt").value.trim();
  if (!prompt) { $("hint").textContent = "Maglagay muna ng task."; return; }
  $("run").disabled = true; $("results").innerHTML = card("TRIAD IS WORKING", "Kinukuha ang independent drafts at peer review…");
  try {
    const response = await fetch("/api/deliberate", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({prompt}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    if (data.status === "needs_setup") {
      $("results").innerHTML = card("KAILANGAN NG PROVIDER SETUP", data.message) + card("PROVIDER STATUS", JSON.stringify(data.providers, null, 2));
      return;
    }
    let html = "";
    if (data.note) html += card("PARTICIPATION", data.note);
    for (const draft of data.drafts || []) html += card(draft.label + " — INDEPENDENT DRAFT", draft.ok ? draft.text : "Unavailable: " + draft.error, draft.ok ? "Successful provider response" : "Not counted as participant");
    for (const review of data.reviews || []) html += card(review.label + " — PEER REVIEW", review.ok ? review.text : "Review unavailable: " + review.error);
    html += data.synthesis ? card("TRIAD SYNTHESIS", data.synthesis) : card("SYNTHESIS UNAVAILABLE", data.synthesisError || "Walang final synthesis.");
    $("results").innerHTML = html;
  } catch (error) { $("results").innerHTML = card("ERROR", error.message); }
  finally { $("run").disabled = false; }
});
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) $("mic").disabled = true;
$("mic").addEventListener("click", () => {
  if (!SpeechRecognition) return;
  const recognition = new SpeechRecognition(); recognition.lang = "fil-PH"; recognition.interimResults = false;
  $("mic").textContent = "🎙 Nakikinig…";
  recognition.onresult = event => { $("prompt").value += ( $("prompt").value ? "\n" : "" ) + event.results[0][0].transcript; };
  recognition.onerror = () => { $("hint").textContent = "Hindi available ang voice input sa browser na ito."; };
  recognition.onend = () => { $("mic").textContent = "🎙 Voice input"; };
  recognition.start();
});
refreshHealth();
