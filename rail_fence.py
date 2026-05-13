def _build_rail_pattern(text_len, rails):
    if rails <= 1:
        return [(0, i) for i in range(text_len)], text_len

    rail_seq = []
    rail = 0
    step = 1
    for _ in range(text_len):
        rail_seq.append(rail)
        rail += step
        if rail == 0 or rail == rails - 1:
            step = -step

    counts = [0] * rails
    for r in rail_seq:
        counts[r] += 1

    pointers = [0] * rails
    positions = []
    for r in rail_seq:
        positions.append((r, pointers[r]))
        pointers[r] += 1

    return positions, max(counts)


def encrypt(text, rails):
    if rails <= 1:
        steps = {
            "type": "rail_fence",
            "rails": rails,
            "note": "Number of rails must be greater than 1",
            "rail_matrix": [[c for c in text]],
            "positions": [{"char": c, "rail": 0, "rail_pos": i} for i, c in enumerate(text)],
            "character_steps": [{"char": c, "rail": 0, "rail_pos": i, "result": c} for i, c in enumerate(text)]
        }
        return text, steps

    positions, max_width = _build_rail_pattern(len(text), rails)

    matrix = [['' for _ in range(max_width)] for _ in range(rails)]
    for i, (r, p) in enumerate(positions):
        matrix[r][p] = text[i]

    result_chars = []
    for r in range(rails):
        for p in range(max_width):
            if matrix[r][p] != '':
                result_chars.append(matrix[r][p])

    char_steps = []
    for i, (r, p) in enumerate(positions):
        char_steps.append({"char": text[i], "rail": r, "rail_pos": p, "result": None})

    result_idx = 0
    for r in range(rails):
        for p in range(max_width):
            if matrix[r][p] != '':
                for orig_i, (orig_r, orig_p) in enumerate(positions):
                    if orig_r == r and orig_p == p:
                        char_steps[orig_i]["result"] = matrix[r][p]
                        break
                result_idx += 1

    display_matrix = []
    for r in range(rails):
        row = []
        for p in range(max_width):
            cell = matrix[r][p]
            row.append(cell if cell != '' else '.')
        display_matrix.append(row)

    steps = {
        "type": "rail_fence",
        "rails": rails,
        "text_length": len(text),
        "rail_matrix": display_matrix,
        "positions": [{"char": text[i], "rail": r, "rail_pos": p} for i, (r, p) in enumerate(positions)],
        "character_steps": char_steps
    }

    return ''.join(result_chars), steps


def decrypt(text, rails):
    if rails <= 1:
        steps = {
            "type": "rail_fence",
            "rails": rails,
            "note": "Number of rails must be greater than 1",
            "rail_matrix": [[c for c in text]],
            "positions": [{"char": c, "rail": 0, "rail_pos": i} for i, c in enumerate(text)],
            "character_steps": [{"char": c, "rail": 0, "rail_pos": i, "result": c} for i, c in enumerate(text)]
        }
        return text, steps

    n = len(text)
    positions, max_width = _build_rail_pattern(n, rails)

    rail_counts = [0] * rails
    for r, _ in positions:
        rail_counts[r] += 1

    rail_contents = []
    idx = 0
    for r in range(rails):
        rail_contents.append(list(text[idx:idx + rail_counts[r]]))
        idx += rail_counts[r]

    matrix = [['' for _ in range(max_width)] for _ in range(rails)]
    rail_pointers = [0] * rails
    for r, p in positions:
        matrix[r][p] = rail_contents[r][rail_pointers[r]]
        rail_pointers[r] += 1

    result_chars = []
    char_steps = []
    for i, (r, p) in enumerate(positions):
        ch = matrix[r][p]
        result_chars.append(ch)
        char_steps.append({"char": ch, "rail": r, "rail_pos": p, "index": i})

    display_matrix = []
    for r in range(rails):
        row = []
        for p in range(max_width):
            cell = matrix[r][p]
            row.append(cell if cell != '' else '.')
        display_matrix.append(row)

    steps = {
        "type": "rail_fence",
        "rails": rails,
        "text_length": n,
        "rail_matrix": display_matrix,
        "operation": "decrypt",
        "positions": [{"char": result_chars[i], "rail": r, "rail_pos": p} for i, (r, p) in enumerate(positions)],
        "character_steps": char_steps
    }

    return ''.join(result_chars), steps
