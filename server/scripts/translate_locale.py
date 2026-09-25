"""One-off generator: translates the English i18n namespace JSON files into a
target language via Bhashini, for client/src/i18n/locales.

Usage: ./venv/Scripts/python.exe scripts/translate_locale.py <lang_code>

{{varName}} interpolation placeholders would otherwise get translated too
(e.g. {{phone}} -> {{फ़ोन}}), breaking i18next. We mask each placeholder as a
plain [N] token before sending text to Bhashini (digit tokens survive NMT
untouched across every language tested — hi/mr/ta/te/bn) and restore the
original {{varName}} afterward.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from utils.bhashini_client import translate  # noqa: E402

PLACEHOLDER_RE = re.compile(r"\{\{(\w+)\}\}")
NAMESPACES = ["common", "auth", "customer", "worker"]
LOCALES_DIR = Path(__file__).resolve().parents[2] / "client" / "src" / "i18n" / "locales"


def mask(text: str) -> tuple[str, list[str]]:
    names: list[str] = []

    def repl(m: re.Match) -> str:
        names.append(m.group(1))
        return f"[{len(names) - 1}]"

    return PLACEHOLDER_RE.sub(repl, text), names


def unmask(text: str, names: list[str]) -> str:
    for i, name in enumerate(names):
        text = text.replace(f"[{i}]", "{{" + name + "}}")
    return text


def translate_value(value, target_lang: str, counter: list[int]):
    if isinstance(value, dict):
        return {k: translate_value(v, target_lang, counter) for k, v in value.items()}
    if isinstance(value, str) and value.strip():
        masked, names = mask(value)
        translated = translate(masked, "en", target_lang)
        counter[0] += 1
        if counter[0] % 25 == 0:
            print(f"  ...{counter[0]} strings translated", flush=True)
        return unmask(translated, names)
    return value


def main() -> None:
    target_lang = sys.argv[1]
    counter = [0]
    for ns in NAMESPACES:
        src_path = LOCALES_DIR / "en" / f"{ns}.json"
        dst_path = LOCALES_DIR / target_lang / f"{ns}.json"
        with open(src_path, encoding="utf-8") as f:
            data = json.load(f)
        print(f"[{target_lang}] translating {ns}.json ({len(json.dumps(data))} chars)...")
        translated = translate_value(data, target_lang, counter)
        with open(dst_path, "w", encoding="utf-8") as f:
            json.dump(translated, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[{target_lang}] wrote {dst_path}")
    print(f"[{target_lang}] done — {counter[0]} strings translated total")


if __name__ == "__main__":
    main()
