def _process(text, key):
    result = []
    char_steps = []

    for ch in text:
        ascii_val = ord(ch)
        xor_val = ascii_val ^ key
        result_char = chr(xor_val)
        result.append(result_char)
        char_steps.append({
            "char": ch,
            "ascii": ascii_val,
            "binary": format(ascii_val, '08b'),
            "key": key,
            "key_binary": format(key, '08b'),
            "xor_ascii": xor_val,
            "xor_binary": format(xor_val, '08b'),
            "result_char": result_char,
            "is_printable": result_char.isprintable()
        })

    steps = {
        "type": "xor",
        "key": key,
        "key_binary": format(key, '08b'),
        "character_steps": char_steps
    }

    return ''.join(result), steps


def encrypt(text, key):
    return _process(text, key)


def decrypt(text, key):
    return _process(text, key)
