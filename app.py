import streamlit as st
import pickle

# ---------- PAGE CONFIG ----------
st.set_page_config(
    page_title="API Risk",
    page_icon="🔐",
    layout="centered"
)

# ---------- LOAD MODEL ----------
@st.cache_resource
def load_models():
    with open("model.pkl","rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl","rb") as f:
        vectorizer = pickle.load(f)
    return model, vectorizer

model, vectorizer = load_models()


# ---------- HEADER ----------
st.markdown("""
<h1 style='text-align:center; color:#38bdf8;'>🔐 API RISK</h1>
<p style='text-align:center; color:gray;'>AI-powered detection for API keys, tokens & sensitive secrets</p>
""", unsafe_allow_html=True)

st.markdown("---")


# ---------- INPUT ----------
text = st.text_area(
    "Paste Code / Message",
    height=200,
    placeholder="Example: api_key = sk-23498234..."
)

scan = st.button("🚀 Scan For Secrets ", use_container_width=True)


# ---------- PREDICTION ----------
if scan:

    if not text.strip():
        st.warning("Please enter text first")
        st.stop()

    lines = text.splitlines()
    found = False

    with st.spinner("Scanning for API secrets..."):

        for line in lines:
            words = line.split()

            for word in words:
                vect = vectorizer.transform([word]).toarray()
                pred = model.predict(vect)[0]

                if pred == 2:
                    st.error("🚨 CRITICAL SECRET DETECTED")
                    st.code(line, language="python")
                    found = True
                    break

                elif pred == 1:
                    st.warning("⚠️ HIGH RISK SECRET DETECTED")
                    st.code(line, language="python")
                    found = True
                    break

            if found:
                break

    if not found:
        st.success("✅ No API Secrets Found — Safe Code")