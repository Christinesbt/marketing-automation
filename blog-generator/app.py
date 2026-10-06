import os
from pathlib import Path
import streamlit as st
import json
import re
import html
from typing import Any
from ollama import Client as OllamaClient
import chromadb
from chromadb.utils import embedding_functions


# -------------------- Page Config --------------------
st.set_page_config(
    page_title="键盘出海内容自动化与审核平台",
    page_icon="⌨️",
    layout="wide"
)

# -------------------- Innitialization of ChromaDB Vector Knowledge Base --------------------
@st.cache_resource
def init_vector_db():
    print("Initializing ChromaDB with custom embedding model...")
    local_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5"))

    client = chromadb.PersistentClient(path=str(Path(os.getenv("CHROMA_PATH", "./.local/chroma")).expanduser()))
    collection = client.get_or_create_collection(
        name="marketing_cases",
        embedding_function=local_ef
    )

    if collection.count() == 0:
        best_practices = [
            "Blog - Professional: Logitech MX series style. Focus on productivity, tactile feedback, ergonomics, and seamless multi-device workflow. Use headers like 'Master Your Flow' or 'Elevate Your Workspace'. Never use 'Introduction' or 'Conclusion'. Tone is authoritative but accessible.",
            "EDM - Promotional (Gaming): Razer style. High-urgency subject lines like 'Level Up Your Setup - 30% Off'. Use short, punchy bullet points highlighting mechanical switches, RGB, and latency. Include a strong CTA like 'Upgrade Now'. Avoid long paragraphs.",
            "Blog - Enthusiast/Custom: Keychron style. Deep dive into specs like gasket mount, CNC aluminum, and hot-swappability. Use community-driven language like 'Built for Customization' and 'The Ultimate Typing Experience'. Enthusiastic and technical tone.",
            "EDM - Product Launch: Apple/Premium style. Minimalist text. Subject: 'Meet the new standard'. Focus on one or two killer features. Let the design (implied by text layout) breathe. Very clean, high-end tone.",
            "Blog - Professional (Ergonomics): Focus on reducing wrist strain and RSI. Highlight split layouts and wrist rests. Use headers like 'Work Smarter, Not Harder' and 'Ergonomics Redefined'. Caring and authoritative tone.",
            "EDM - Black Friday (Gaming): High impact. Subject: 'DO NOT MISS: 50% Off Top-Tier Gear'. Flashy, urgent tone. Mention 'Limited Stock' and 'Dominate the Leaderboards'.",
            "Blog - Enthusiast (Sound Profile): Deep dive into acoustic foam, thocky sound profiles, and PE foam mods. Headers: 'The Anatomy of Sound' or 'Achieve the Perfect Thock'. Highly technical and passionate.",
            "EDM - Clearance Sale: Subject: 'Last Chance: The Ultimate Typing Upgrade'. Straight to the point, urgency-driven, clear CTA 'Shop the Sale' with bold text on the discount.",
            "Blog - Custom (Switch Lube Guide): Educational format. 'Lube Your Switches Like a Pro'. Step-by-step approach, community-focused, reassuring tone for beginners.",
            "EDM - Christmas/Holiday Promo: Warm, festive tone. Subject: 'Gift the Joy of Premium Typing'. Focus on unboxing experience, premium feel, and perfect gifting. Soft sell.",
            "Blog - Gaming (Esports Focus): Aggressive, competitive tone. 'Why Optical Switches Matter in Esports'. Focus strictly on debounce delay, actuation point, and zero latency.",
            "EDM - VIP Pre-order: Exclusive tone. Subject: 'You're on the list. Early access to our CNC Aluminum board'. Reward-focused, emphasizing scarcity and community status.",
            "Blog - Professional (Minimalist Desk Setup): Aesthetic and space-saving focus. Highlight 75% or 65% layouts and wireless connectivity. 'The Minimalist Desk Setup' or 'Clutter-Free Productivity'.",
            "EDM - Abandoned Cart: Friendly, persuasive nudge. Subject: 'You Left Something Awesome Behind'. Brief reminder of the core features, maybe include a 5% discount code to close the sale.",
            "Blog - Enthusiast (Keycap Materials): 'PBT vs ABS Keycaps: The Ultimate Showdown'. Deep comparative analysis, objective but enthusiast-leaning, focusing on shine-resistance and texture.",
            "EDM - Newsletter (Community Update): Informative, low sales pressure. Subject: 'This Month in Keyboards: New Switches Dropping'. Share behind-the-scenes manufacturing pics or community setups.",
            "Blog - Gaming (MMO/MOBA Setup): Utility-focused. 'Top 5 Macro Setups for MMO Players'. Emphasize programmable keys, software integration, and high-energy gamer jargon.",
            "EDM - Flash Sale (48 Hours): High urgency, neon/cyberpunk aesthetic implied by text. Subject: '48 Hours Only: Upgrade Your Battlestation'. Short sentences, aggressive CTA.",
            "Blog - Custom (Hot-Swappable Intro): Welcoming, demystifying jargon. 'A Beginner's Guide to Hot-Swappable PCBs'. Emphasize freedom of choice and not needing a soldering iron.",
            "EDM - Educational Nurture: Value-add email, no hard sell. Subject: 'Unlock Your Keyboard's Hidden Features'. Explain layered functions or quick Bluetooth switching.",
            "Blog - Premium (Craftsmanship): Brand-building. 'The Craftsmanship Behind Our CNC Aluminum Chassis'. Focus on manufacturing precision, anodizing process, and luxury tone.",
            "EDM - Back to School: Target students/coders. Subject: 'Ace Your Semesters with the Perfect Keystroke'. Focus on quiet switches for dorms and long battery life for studying.",
            "Blog - Professional (Mac Compatibility): Focus on seamless integration with Apple ecosystem. 'The Ultimate Mac Companion'. Highlight Command/Option keycaps and fast switching.",
            "EDM - Cross-sell (Accessories): Post-purchase email. Subject: 'Complete Your Setup'. Recommend matching wrist rests, custom coiled cables, or switch puller kits.",
            "Blog - Custom (Plate Materials): Deep technical dive into FR4, Polycarbonate, and Brass plates. 'How Plate Materials Affect Your Typing Feel'. Very analytical and data-driven."
        ]

        ids = [f"case_{i}" for i in range(1, 26)]

        metadatas = [
            {"type": "Blog", "style": "Professional"}, {"type": "EDM", "style": "Gaming"},
            {"type": "Blog", "style": "Custom"}, {"type": "EDM", "style": "Premium"},
            {"type": "Blog", "style": "Professional"}, {"type": "EDM", "style": "Gaming"},
            {"type": "Blog", "style": "Custom"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Custom"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Gaming"}, {"type": "EDM", "style": "Premium"},
            {"type": "Blog", "style": "Professional"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Custom"}, {"type": "EDM", "style": "Community"},
            {"type": "Blog", "style": "Gaming"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Custom"}, {"type": "EDM", "style": "Educational"},
            {"type": "Blog", "style": "Premium"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Professional"}, {"type": "EDM", "style": "Promotional"},
            {"type": "Blog", "style": "Custom"}
        ]

        collection.add(documents=best_practices, ids=ids, metadatas=metadatas)
        print("Successfully added 25 cases into ChromaDB collection.")

    return collection

chroma_collection = init_vector_db()

# -------------------- Initialize of Session State --------------------
if "generated_content" not in st.session_state:
    st.session_state.generated_content = ""
if "final_content" not in st.session_state:
    st.session_state.final_content = ""
if "original_draft" not in st.session_state:
    st.session_state.original_draft = ""

# -------------------- Sidebar: API and Parameter Configuration --------------------
with st.sidebar:
    st.header("⚙️ 系统与参数配置")

    api_base = st.text_input("Ollama API 地址", value=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"), placeholder="http://127.0.0.1:11434")
    api_key = st.text_input("Bearer Token (可选)", type="password", value=os.getenv("OLLAMA_API_KEY", ""))
    model_name = st.text_input("模型名称", value=os.getenv("OLLAMA_MODEL", "qwen2.5:7b"))

    st.divider()

    input_language = st.radio("🌐 输入语言", ["中文", "English"], index=0)
    target_language = st.selectbox("🎯 目标生成语言", ["English", "German (Deutsch)", "French (Français)", "Spanish (Español)"], index=0)

    st.divider()
    st.markdown("### 🎛️ Agent 参数调优")

    gen_temperature = st.slider(
        "🧠 Drafter Agent Temperature",
        min_value=0.0, max_value=2.0, value=0.7, step=0.1,
        help="较高值 (0.7-1.0) 适合激发创意，写出吸引人的营销文案。"
    )

    critic_temperature = st.slider(
        "🕵️ Critic Agent Temperature",
        min_value=0.0, max_value=2.0, value=0.1, step=0.1,
        help="极低值 (0.0-0.1) 保证审核规则被严格遵守，防止 JSON 格式崩溃。"
    )

# -------------------- Main UI --------------------
st.title("⌨️ 键盘出海 AI 营销自动化平台 (RAG 版)")
st.markdown("##### --Keyboard Global AI Marketing Automation Platform (with RAG)")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("📝 营销内容简报 (Marketing Content Brief)")
    content_type = st.selectbox("内容类型 (Content Type)", ["Blog - 产品介绍", "Blog - 场景适配", "EDM - 新品推广", "EDM - 黑五促销", "EDM - 圣诞促销", "EDM - 清仓"])
    style = st.selectbox("品牌基调/风格 (Brand Tone/Style)", ["专业严谨（办公/商务 - 类似罗技）", "亲和活泼（游戏/客制化 - 类似雷蛇/Keychron）"])

    product_name = st.text_input("产品名称 (Product Name)", placeholder="例如：Pro Mechanical Keyboard")
    core_features = st.text_area("核心卖点 (Core Features)", placeholder="例如：Blue switches\n10000mAh battery\n热插拔\n蓝牙5.3")

    discount_info = ""
    discount_validity = ""
    if "EDM" in content_type:
        discount_info = st.text_input("折扣力度 (选填，无促销留空)（Discount Info)", placeholder="例如：30% OFF")
        discount_validity = st.text_input("折扣有效期 (选填) (Discount Validity)", placeholder="例如：202X.11.24-11.27")

    generate_btn = st.button("🚀 RAG 检索并生成内容 (RAG Search & Generate)", type="primary", use_container_width=True)

with col2:
    status_title_col, status_action_col = st.columns([3, 2])
    with status_title_col:
        st.subheader("🤖 AI Agent")
    with status_action_col:
        st.markdown("<div style='height: 6px'></div>", unsafe_allow_html=True)
        st.download_button(
            "📥 导出文案(Export Text)",
            data=st.session_state.final_content,
            file_name="marketing_copy.txt",
            key="top_export_btn",
            use_container_width=True
        )

    progress_placeholder = st.empty()



st.markdown("""
<style>
.trace-grid {display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:12px;}
.status-card {position:relative; border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; background:#ffffff; color:#374151; overflow:hidden;}
.status-card.pending {opacity:0.55;}
.status-card.loading {border-color:#93c5fd; background:linear-gradient(135deg,#eff6ff,#ffffff);}
.status-card.done {border-color:#86efac; background:linear-gradient(135deg,#f0fdf4,#ffffff);}
.status-card.loading::before {content:""; position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.85),rgba(255,255,255,0)); animation:cardShimmer 1.25s ease-in-out infinite;}
.loading-dot {display:inline-block; margin-left:6px; animation:dotPulse 1s ease-in-out infinite;}
.draft-stream {text-align:center; color:#94a3b8; font-size:1.05rem; line-height:1.75; padding:18px 12px; min-height:210px; display:flex; align-items:center; justify-content:center;}
.draft-stream .inner {max-width:92%;}
.typing-cursor {animation:cursorBlink 0.95s step-end infinite;}
.approved {animation:textApprove 1.1s ease forwards;}
.final-trace-scroll {border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#f8fafc; color:#111827; line-height:1.75; max-height:320px; overflow-y:auto; white-space:pre-wrap; transition:color .35s ease;}
.final-trace-scroll.faded {color:#94a3b8;}


@keyframes cardShimmer {100% {transform:translateX(100%);}}
@keyframes dotPulse {0%,100%{opacity:.35;}50%{opacity:1;}}
@keyframes cursorBlink {0%,100%{opacity:1;}50%{opacity:.15;}}
@keyframes textApprove {0%{color:#94a3b8;}55%{color:#6366f1;}100%{color:#111827;}}
</style>
""", unsafe_allow_html=True)


def _render_trace_log(
    phase: str,
    final_text: str = "",
    faded: bool = False,
    streaming: bool = False,
    auto_scroll: bool = False,
    critic_status_text: str = "",
    critic_status_state: str = "loading"
) -> str:

    phase_label_map = {
        "rag": "正在查阅行业案例...",
        "draft": "正在基于核心卖点生成初稿...",
        "critic": "正在根据专业品牌调性优化措辞..."
    }

    trace_html = ""
    if phase in phase_label_map:
        trace_html += f"<div class='trace-grid'><div class='status-card loading'>{phase_label_map[phase]}<span class='loading-dot'>●</span></div></div>"

    if critic_status_text:
        suffix = "<span class='loading-dot'>●</span>" if critic_status_state == "loading" else (" ✅" if critic_status_state == "done" else " ⚠️")
        status_text_html = html.escape(critic_status_text).replace("\n", "<br>")
        trace_html += f"<div class='critic-status-wrap'><div class='status-card {critic_status_state}'>{status_text_html}{suffix}</div></div>"


    if final_text:
        cursor = "<span class='typing-cursor'>▌</span>" if streaming else ""
        faded_class = " faded" if faded else ""
        trace_html += (
            "<div style='margin-top:10px'><strong>AI生成文本（AI Generated Text）</strong>"
            f"<div id='ai-stream-box' class='final-trace-scroll{faded_class}'>{html.escape(final_text)}{cursor}</div></div>"
        )

    if auto_scroll:
        trace_html += """
        <script>
        const box = document.getElementById('ai-stream-box');
        if (box) {
            requestAnimationFrame(() => {
                box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
            });
        }
        </script>
        """


    return trace_html




# -------------------- Knowledge/Rules --------------------
KEYBOARD_TERMS = {

    "青轴": "Blue switch", "红轴": "Red switch", "茶轴": "Brown switch","磁轴": "Magnetic switch",
    "热插拔": "hot-swappable", "客制化": "custom", "无线": "wireless",
    "蓝牙": "Bluetooth", "2.4G": "2.4GHz", "续航": "battery life",
    "人体工学": "ergonomic", "多设备": "multi-device", "背光": "backlit",
    "PBT键帽": "PBT keycaps", "铝合金": "aluminum body", "Gasket结构": "gasket mount",
}

FORBIDDEN_WORDS = [
    "best", "perfect", "smoothest", "fastest", "zero latency",
    "flawless", "ultimate", "revolutionary", "game-changing"
]

FORBIDDEN_COMPETITORS = ["Razer", "Logitech", "Keychron", "Apple"]

# -------------------- Translation Function (Prefer Using Glossary)--------------------
def translate_to_english(client: OllamaClient, text: str, model: str) -> str:
    """
    将中文术语翻译为英文。优先使用 KEYBOARD_TERMS 术语表进行精确替换，
    对于术语表中不存在的词汇，再调用 LLM 进行翻译。
    """
    if not text.strip():
        return text

    # 1. Glossary replacement (in descending order of Chinese length to avoid incorrect matching of shorter terms)
    terms_sorted = sorted(KEYBOARD_TERMS.items(), key=lambda x: len(x[0]), reverse=True)
    translated_text = text
    for cn_term, en_term in terms_sorted:
        # Use regex full-word matching (direct replacement is possible in Chinese context)
        pattern = re.compile(re.escape(cn_term))
        translated_text = pattern.sub(en_term, translated_text)

    # 2. If Chinese characters still remain after replacement, invoke LLM to translate the remaining part
    if re.search(r'[\u4e00-\u9fff]', translated_text):
        try:
            res = client.generate(
                model=model,
                prompt=f"Translate the following Chinese to English directly without any prefix or explanation. Keep already English words unchanged: {translated_text}",
                stream=False
            )
            translated_text = res.get('response', '').strip()
        except Exception:
            # When translation fails, keep the already replaced result
            pass
    return translated_text

# --------------------  Prompt (Drafter Agent) --------------------
def build_prompt(content_type, style, product_name, features, target_lang, reference_case, discount="", validity=""):
    style_desc = {
        "专业严谨（办公/商务 - 类似罗技）": "professional, data-driven, focusing on productivity and ergonomics",
        "亲和活泼（游戏/客制化 - 类似雷蛇/Keychron）": "casual, enthusiastic, engaging, focusing on gaming/customization"
    }[style]

    if "Blog" in content_type:
        task_struct = """
        - Catchy Marketing Headline (H1)
        - Engaging Hook
        - Core Value Proposition (Use H2s or bullet points)
        - Real-World Scenarios
        - Call-to-Action
        """
        anti_academic_rule = "**CRITICAL RULE**: Do NOT use academic headings like 'Introduction', 'Conclusion'. Use marketing subheadings."
    else:
        if discount.strip():
            offer_line = f"- The Hook/Offer: Highlight the discount: {discount} valid until {validity if validity else 'limited time'}."
        else:
            offer_line = "- The Hook/Offer: Focus purely on product value or new release. ABSOLUTELY NO discounts, sales, or validity dates should be mentioned."

        task_struct = f"""
        - Subject Line: (High open-rate)
        - Preheader Text: (Short preview)
        - Greeting
        {offer_line}
        - Key Features: (Short punchy bullet points)
        - Strong Call-to-Action
        - Footer: (Unsubscribe link and Privacy notice)
        """
        anti_academic_rule = "**CRITICAL RULE**: This is an email. Keep paragraphs short (1-3 sentences). No 'Conclusion' headings."

    prompt = f"""
Persona: You are a Top-Tier Marketing Copywriter specializing in keyboards for the overseas market.
Task Constraints:
- Output Language: {target_lang}
- Content Type: {content_type}
- Tone of Voice: {style_desc}
- Required Structure: {task_struct}

{anti_academic_rule}

[DEFENSIVE RULES - STRICT PROHIBITION]
1. ANTI-HALLUCINATION: You MUST ONLY discuss the exact features provided in the "Input Product Data". DO NOT invent, assume, or add ANY extra features.
2. NO FORBIDDEN WORDS: Do not use absolute terms: {', '.join(FORBIDDEN_WORDS)}.

[CRITICAL BRAND ISOLATION]
- The user's product name is EXACTLY AND ONLY: "{product_name}".
- YOU MUST NEVER MENTION COMPETITORS: {', '.join(FORBIDDEN_COMPETITORS)}.
- DO NOT even use phrases like "Razer-style" or "better than Logitech".
- If the RAG context mentions a competitor brand, EXTRACT THE VIBE/FORMAT ONLY and ABSOLUTELY DISCARD THE BRAND NAME.

[INDUSTRY BEST PRACTICE (RAG Context)]
Use the following case ONLY for its tone, formatting, and vibe. NEVER copy its brand names into your text:
"{reference_case}"

[KEYBOARD TERMINOLOGY GLOSSARY]
{chr(10).join([f"- {cn} -> {en}" for cn, en in KEYBOARD_TERMS.items()])}

Input Product Data:
- Product Name: {product_name}
- Core Features: {', '.join(features)}

Think step by step within <think> and </think> tags. Map the EXACT provided features to benefits, apply the RAG context style (WITHOUT the competitor brand names), and output the final formatted marketing copy.
"""
    return prompt

def ollama_generate_stream(client: OllamaClient, prompt: str, model: str, temp: float):
    options = {"num_ctx": 8192, "temperature": temp, "top_p": 0.9}
    return client.generate(model=model, prompt=prompt, stream=True, options=options)

# -------------------- Critic Agent --------------------
def ollama_critic_agent_stream(client: OllamaClient, model_name: str, original_text: str, content_type: str, temp: float, product_name: str) -> dict[str, Any]:
    edm_check = "3. EDM Compliance: If it's an EDM, it must have an Unsubscribe/Privacy notice." if "EDM" in content_type else ""
    academic_check = "4. Formatting: Ensure there are NO headings like 'Introduction' or 'Conclusion'."
    hallucination_check = "5. Hallucination Check: Ensure NO features or discounts were mentioned that were not in the original input."

    brand_check = f"""6. **STRICT BRAND AUDIT**:
   - The user's product name is: "{product_name}".
   - FORBIDDEN BRANDS: {', '.join(FORBIDDEN_COMPETITORS)}.
   - If ANY forbidden brand name appears in the "Original text", you MUST mark "passed": false.
   - You MUST list the specific forbidden brand found in the "issues" list and replace it with "{product_name}" in the "corrected_text"."""

    critic_prompt = f"""
You are an AI Compliance & Quality Critic. Review the following marketing copy for a keyboard:

Rules:
1. No forbidden terms: {', '.join(FORBIDDEN_WORDS)}.
2. Terminology accuracy (e.g., hot-swappable).
{edm_check}
{academic_check}
{hallucination_check}
{brand_check}

Original text:
---
{original_text}
---

First, think step by step about the violations inside <think> and </think> tags. Then, evaluate and output ONLY a raw JSON format.

**CRITICAL JSON RULES**:
1. You MUST output VALID JSON ONLY. Do not wrap it in markdown blockquotes like ```json ... ```.
2. Escape all newlines in strings as `\\n`.
3. NO trailing commas allowed! (e.g. ["a", "b",] is WRONG, ["a", "b"] is CORRECT).
**CRITICAL INSTRUCTION FOR 'corrected_text'**:
If corrections are needed, STRICTLY PRESERVE the original formatting, headings, bullet points, and all non-violating content. ONLY change the specific words that violate the rules. Do NOT rewrite the whole text.

{{
  "passed": true/false,
  "feedback": "briefly explain any violations and exactly what you changed",
  "corrected_text": "Provide the FULL text with corrections applied, strictly keeping the original formatting",
  "issues": ["list", "of", "specific", "issues", "found"]
}}
"""
    response_stream = client.generate(model=model_name, prompt=critic_prompt, stream=True, options={"num_ctx": 8192, "temperature": temp})

    critic_full_text = ""
    for chunk in response_stream:
        critic_full_text += chunk.get('response', '')

    text_without_think = re.sub(r'<think>.*?</think>', '', critic_full_text, flags=re.DOTALL)


    if "<think>" in text_without_think:
        text_without_think = text_without_think.split("<think>")[0]

    json_match = re.search(r'\{.*\}', text_without_think, re.DOTALL)

    if json_match:
        raw_json_str = json_match.group(0)
        try:
            return json.loads(raw_json_str, strict=False)
        except json.JSONDecodeError as e:
            try:
                fixed_json_str = re.sub(r',\s*([}\]])', r'\1', raw_json_str)
                return json.loads(fixed_json_str, strict=False)
            except json.JSONDecodeError:
                print("Critic JSON parse failed; raw model output omitted.")
                raise ValueError(f"解析 JSON 失败。模型输出了非法格式: {e}")
    else:
        raise ValueError("未能在模型回复中找到大括号 { } 包裹的 JSON 数据。")

# -------------------- Graph/Workflow --------------------
if generate_btn:
    client = None
    try:
        headers = {'Authorization': f'Bearer {api_key}'} if api_key else {}
        client = OllamaClient(host=api_base, headers=headers)
    except Exception as e:
        st.error(f"Client init failed: {str(e)}")
        st.stop()

    if client is None:
        st.stop()


    if not product_name or not core_features:
        st.error("请输入必填的产品名称和核心卖点！")
        st.stop()

    features_list = [f.strip() for f in core_features.split("\n") if f.strip()]

    progress_placeholder.markdown(_render_trace_log("rag"), unsafe_allow_html=True)


    # Phase 1: Translation and RAG Retrieval
    with st.spinner("正在查阅行业案例..."):
        if input_language == "中文":
            product_name = translate_to_english(client, product_name, model_name)
            features_list = [translate_to_english(client, feat, model_name) for feat in features_list]

        search_query = f"{content_type} {style}"
        try:
            rag_results = chroma_collection.query(query_texts=[search_query], n_results=1)
            reference_case = rag_results["documents"][0][0] if rag_results["documents"] else "Use standard compelling marketing practices."
        except Exception:
            reference_case = "Use standard compelling marketing practices."

    # Phase 2: Drafting with Streaming Generation
    progress_placeholder.markdown(_render_trace_log("draft"), unsafe_allow_html=True)
    prompt = build_prompt(content_type, style, product_name, features_list, target_language, reference_case, discount_info, discount_validity)

    text_so_far = ""
    final_output_text = ""

    try:
        for chunk in ollama_generate_stream(client, prompt, model_name, gen_temperature):
            text_so_far += chunk.get('response', '')

            if "<think>" in text_so_far and "</think>" in text_so_far:
                final_output_text = text_so_far.split("</think>", 1)[1].lstrip()
            elif "<think>" not in text_so_far:
                final_output_text = text_so_far

            progress_placeholder.markdown(
                _render_trace_log("draft", final_text=final_output_text, streaming=True, auto_scroll=False),
                unsafe_allow_html=True
            )



        if not final_output_text.strip():

            final_output_text = re.sub(r'<think>.*?</think>', '', text_so_far, flags=re.DOTALL).strip()

        progress_placeholder.markdown(
            _render_trace_log("draft", final_text=final_output_text, streaming=False, auto_scroll=False),
            unsafe_allow_html=True
        )

        st.session_state.original_draft = final_output_text


    except Exception as e:
        st.error(f"Generation failed: {str(e)}")
        st.stop()

    # Phase 3: Critic Review
    progress_placeholder.markdown(
        _render_trace_log(
            "critic",
            final_text=st.session_state.original_draft,
            faded=True,
            critic_status_text="正在审核中...",
            critic_status_state="loading"
        ),
        unsafe_allow_html=True
    )


    max_retries = 3


    critic_result = None

    for attempt in range(max_retries):
        try:
            critic_result = ollama_critic_agent_stream(
                client, model_name, final_output_text, content_type, critic_temperature, product_name
            )
            break
        except Exception as e:
            if attempt == max_retries - 1:
                critic_result = {
                    "passed": False,
                    "feedback": f"审核模型解析故障 (已重试 {max_retries} 次): {str(e)}。为保证流程不中断，强制输出原草稿。",
                    "corrected_text": final_output_text,
                    "issues": ["Critic 解析 JSON 崩溃"]
                }
            else:
                st.toast(f"审核解析受挫，触发自愈重试 ({attempt + 1}/{max_retries})...")

    if critic_result is None:
        critic_result = {
            "passed": False,
            "feedback": "审核流程未返回有效结果，已保留草稿。",
            "corrected_text": final_output_text,
            "issues": ["Critic 未返回结果"]
        }

    corrected_text_raw = critic_result.get("corrected_text", final_output_text)
    corrected_text = corrected_text_raw if isinstance(corrected_text_raw, str) else final_output_text
    passed = bool(critic_result.get("passed", False))

    # Block Competitor Keywords
    if passed:
        text_to_check = corrected_text.lower()
        found_competitors = [b for b in FORBIDDEN_COMPETITORS if b.lower() in text_to_check]

        if found_competitors:
            passed = False
            issues_raw = critic_result.get("issues", [])
            issues_list = issues_raw if isinstance(issues_raw, list) else []
            critic_result["issues"] = issues_list + [f"System Override: Detected forbidden competitors {found_competitors}"]
            critic_result["feedback"] = f"AI 审核漏检，系统底层已自动拦截违规竞品词: {', '.join(found_competitors)}。"

            for b in found_competitors:
                pattern = re.compile(re.escape(b), re.IGNORECASE)
                corrected_text = pattern.sub(product_name, corrected_text)

    critic_result["passed"] = passed
    critic_result["corrected_text"] = corrected_text

    st.session_state.final_content = corrected_text

    issues_raw_final = critic_result.get("issues", [])
    issues_list_final = issues_raw_final if isinstance(issues_raw_final, list) else []
    issues_text = "；".join([str(item) for item in issues_list_final[:2]]) if issues_list_final else "无"
    corrected_preview = st.session_state.final_content.replace("\n", " ").strip()
    if len(corrected_preview) > 90:
        corrected_preview = corrected_preview[:90] + "..."

    if passed:
        critic_status_text = "审核通过\n结果：未发现问题。"
        critic_status_state = "done"
    else:
        critic_status_text = f"检测到问题并完成修正\n问题：{issues_text}\n修改结果：{corrected_preview}"
        critic_status_state = "warn"

    # The final text is presented below the real-time agent collaboration status (scroll to view)
    progress_placeholder.markdown(
        _render_trace_log(
            "done",
            final_text=st.session_state.final_content,
            critic_status_text=critic_status_text,
            critic_status_state=critic_status_state
        ),
        unsafe_allow_html=True
    )
