"""Generate all Tani Archive images via Gemini Nano Banana.

Reads image specs from IMAGE_SPECS below, generates each one with a highly
descriptive Mising/Tani-tribal prompt, saves the PNG to /app/backend/uploads/generated/
and writes /app/frontend/src/aiImages.js with the resulting URL map.

Run: python generate_images.py
"""
import asyncio
import base64
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent))

load_dotenv(Path(__file__).parent / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT_DIR = Path(__file__).parent / "uploads" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"

# Common style suffix so all images feel like one archive
STYLE = (
    " Photographic realism, warm natural lighting, documentary style, "
    "authentic Northeast India tribal aesthetic, do NOT include Assamese Bihu attire "
    "(no white-and-red Mekhela-Chador), no African tribal imagery, no Western clothing. "
    "Cinematic, respectful, editorial photograph. 16:10 aspect."
)

IMAGE_SPECS = [
    # === HERO CROSSFADE (4) ===
    ("hero_ali_ai_ligang_1",
     "A group of young Mising tribal women from Assam, Northeast India, dancing the Gumrag Soman in a green paddy field during the Ali-Ai-Ligang spring sowing festival. They wear the traditional Mising Ege (a wraparound skirt with horizontal red, black and cream stripes) and Gasor (chest cloth). Silver ornaments, hair tied back with red thread. Golden late-afternoon light."),
    ("hero_ali_ai_ligang_2",
     "A wide shot of a Mising village in Majuli, Assam, during Ali-Ai-Ligang. Men in white cotton dhotis with striped shawls (Mibu Galuk) sowing first paddy seeds. Traditional Chang-Ghar bamboo stilt houses in the background. Misty morning."),
    ("hero_ali_ai_ligang_3",
     "Close-up of a Mising woman weaving on a back-strap loom, weaving the red-black striped Ege cloth. Warm sunlight, hands and threads in focus, wooden shuttle."),
    ("hero_ali_ai_ligang_4",
     "A circle of Mising musicians and dancers around a bonfire at night during the Porag festival. Bamboo dhol drum, gong. Women in Ege-Gasor, men in Mibu Galuk. Sparks flying up, joyful faces."),

    # === TANI CLAN CARDS (6) ===
    ("tribe_mising",
     "Portrait of a Mising tribal woman from Assam wearing an authentic red and black striped Ege wraparound skirt and cream Gasor chest cloth, silver disk earrings, hair in a tight bun with red string. Standing beside a bamboo Chang-Ghar stilt house."),
    ("tribe_apatani",
     "Elderly Apatani tribal woman from Ziro valley, Arunachal Pradesh, showing distinctive facial tattoo lines from forehead to chin and large black wooden nose plugs (Yaping Hurlo). Wearing a dark handwoven wraparound. Terraced rice fields behind."),
    ("tribe_adi",
     "Adi tribal woman from Siang valley, Arunachal Pradesh, wearing colourful hand-woven Gale skirt with geometric patterns and beaded necklaces. Traditional Beyop cane basket. Performing Ponung dance."),
    ("tribe_galo",
     "Galo tribal group from West Siang, Arunachal Pradesh, celebrating Mopin festival. Women in white Gale-yakan attire with red bands, sprinkling rice-flour on each other. Bamboo pole altar in the background."),
    ("tribe_nyishi",
     "Nyishi tribal man from Papum Pare, Arunachal Pradesh, wearing the distinctive Bopa cane hat topped with a real hornbill beak, a cotton striped shawl, and carrying a traditional dao knife. Forested hillside village behind."),
    ("tribe_tagin",
     "Tagin tribal woman from Upper Subansiri, Arunachal Pradesh, wearing dark hand-woven wraparound with cowrie shell necklaces. Hill village setting. Si-Donyi ritual bamboo pole in background."),

    # === LATEST ARTICLES (6) ===
    ("article_etymology_mising",
     "Mising elder woman holding a woven Ege cloth up to sunlight, showing the red-black striped pattern. Wooden interior of a Chang-Ghar house."),
    ("article_donyi_polo",
     "A wooden Donyi-Polo altar with sun and crescent moon carvings, Tani religion. Rice-beer offering bowl, feathers, incense smoke rising."),
    ("article_mising_vocabulary",
     "Young Mising woman writing Mising script (Roman-adapted) in a notebook, seated on the bamboo veranda of a Chang-Ghar."),
    ("article_tani_migration",
     "Wide landscape of the eastern Himalayan foothills of Arunachal Pradesh with the Siang river flowing down to the plains of Assam. Morning mist. No people."),
    ("article_chang_ghar",
     "A traditional Mising Chang-Ghar bamboo stilt house on the banks of the Brahmaputra, raised on tall wooden stilts, thatched roof, bamboo ladder. Ducks under the house."),
    ("article_apong",
     "Mising elder woman preparing Poro Apong (traditional rice beer) in a bamboo tube, with rice grains, herbs and a clay pot. Wooden kitchen of a Chang-Ghar. Warm hearth firelight."),

    # === MANUSCRIPTS / ORAL TEXTS (5) ===
    ("manuscript_abang",
     "A Mibu priest of the Mising community chanting the Abang oral epic, seated cross-legged, wearing a striped shawl, with a bamboo staff and a bowl of Apong beside him. Firelight."),
    ("manuscript_nitom",
     "Two Mising women singing Nitom folk song at dusk, seated on Chang-Ghar veranda in Ege-Gasor attire. Silhouetted against orange sky."),
    ("manuscript_midang",
     "A Mising wedding ritual (Midang), bride in Ege-Gasor red-striped attire, groom in Mibu Galuk white jacket, elder priest blessing them, rice grains being sprinkled."),
    ("manuscript_oi_nitom",
     "Two young Mising villagers, a boy and a girl, singing an antiphonal Oi Nitom love song beside a paddy field at sunset. Girl in red-black Ege, boy in white shirt with striped shawl."),
    ("manuscript_kaben",
     "Elder Mising men seated in a circle inside a village Kebang council house, discussing, one of them speaking a Kaben (wisdom saying). Bamboo interior, natural light."),

    # === VIDEOS (6) ===
    ("video_gumrag",
     "A dynamic line of Mising women mid-motion performing the Gumrag Soman harvest dance, arms raised, red-black-striped Ege swirling. Green paddy field backdrop."),
    ("video_porag",
     "Night celebration of the Mising Porag festival: bonfire, dhol drummers, dancers in Ege-Gasor, cheerful faces, sparks in the air."),
    ("video_oi_nitom",
     "Two Mising singers, man and woman in traditional attire, singing at a village gathering with a bamboo flute player beside them. Chang-Ghar behind."),
    ("video_ali_ai_ligang_doc",
     "Documentary still of a Mising village family sowing the first paddy seeds together during Ali-Ai-Ligang, sunlit field, elders and children."),
    ("video_weaving",
     "Overhead shot of a Mising woman's hands weaving the Ege on a back-strap loom, red and black threads clearly visible, wooden shuttle in motion."),
    ("video_apong",
     "Close-up of Poro Apong (Mising rice-beer) being poured from a bamboo tube into a small bamboo cup, warm firelight, rice grains and herbs on the wooden table."),
]


async def generate_one(name: str, prompt: str) -> str | None:
    out_path = OUT_DIR / f"{name}.png"
    if out_path.exists():
        return str(out_path)
    api_key = os.environ["EMERGENT_LLM_KEY"]
    chat = (
        LlmChat(api_key=api_key, session_id=f"gen-{name}", system_message="")
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    full_prompt = prompt + STYLE
    try:
        _text, images = await chat.send_message_multimodal_response(UserMessage(text=full_prompt))
    except Exception as e:
        print(f"[ERR] {name}: {e}")
        return None
    if not images:
        print(f"[WARN] {name}: no image returned")
        return None
    b = base64.b64decode(images[0]["data"])
    out_path.write_bytes(b)
    print(f"[OK] {name}: {len(b)/1024:.0f} KB")
    return str(out_path)


async def main():
    results = {}
    # Run serially to avoid rate limiting
    for name, prompt in IMAGE_SPECS:
        path = await generate_one(name, prompt)
        if path:
            results[name] = f"/api/uploads/generated/{name}.png"
    # Write frontend map
    fe = Path("/app/frontend/src/aiImages.js")
    lines = ["// AUTO-GENERATED by /app/backend/generate_images.py \u2014 do not edit by hand.",
             "const BACKEND = process.env.REACT_APP_BACKEND_URL || '';",
             "const url = (p) => `${BACKEND}${p}`;",
             "export const aiImages = {"]
    for k, v in results.items():
        lines.append(f"  {k}: url({json.dumps(v)}),")
    lines.append("};")
    fe.write_text("\n".join(lines) + "\n")
    print(f"[DONE] {len(results)} images. Map written to {fe}")


if __name__ == "__main__":
    asyncio.run(main())
