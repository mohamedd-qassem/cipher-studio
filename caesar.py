import string

ALPHABET = string.ascii_uppercase


def _shift_alphabet(key):
    key = key % 26
    return ALPHABET[key:] + ALPHABET[:key]


def encrypt(text, key):
    key = key % 26
    shifted = _shift_alphabet(key)
    result = []
    char_steps = []

    for ch in text:
        if ch.isalpha():
            is_upper = ch.isupper()
            upper_ch = ch.upper()
            idx = ALPHABET.index(upper_ch)
            new_idx = (idx + key) % 26
            encrypted_char = shifted[idx]
            if not is_upper:
                encrypted_char = encrypted_char.lower()
            result.append(encrypted_char)
            char_steps.append({
                "char": ch,
                "index": idx,
                "shifted_index": new_idx,
                "result": encrypted_char
            })
        else:
            result.append(ch)
            char_steps.append({
                "char": ch,
                "index": None,
                "shifted_index": None,
                "result": ch
            })

    steps = {
        "type": "caesar",
        "shift": key,
        "alphabet": ALPHABET,
        "shifted_alphabet": shifted,
        "character_steps": char_steps
    }

    return ''.join(result), steps


def decrypt(text, key):
    return encrypt(text, 26 - (key % 26))
