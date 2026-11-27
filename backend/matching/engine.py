WEIGHTS = {
    "budget": 25,
    "area": 20,
    "move_in": 15,
    "cleanliness": 12,
    "sleep_schedule": 8,
    "guest_frequency": 6,
    "smoking": 5,
    "pets": 4,
    "work_mode": 3,
    "noise_preference": 2,
}


def match_profiles(a, b):
    """Rules-based 0-100 compatibility with hard filters and human-readable reasons."""
    reasons = []
    differences = []

    a_min, a_max = a.budget_min or None, a.budget_max or None
    b_min, b_max = b.budget_min or None, b.budget_max or None
    if all(value is not None for value in (a_min, a_max, b_min, b_max)) and max(a_min, b_min) > min(a_max, b_max):
        return None

    a_areas = set(a.preferred_areas or [])
    b_areas = set(b.preferred_areas or [])
    shared_areas = a_areas & b_areas
    if a_areas and b_areas and not shared_areas:
        return None

    if a.move_in_date and b.move_in_date:
        days_apart = abs((a.move_in_date - b.move_in_date).days)
        if days_apart > 30:
            return None
    else:
        days_apart = None

    total = 0
    available_weight = 0

    def add(weight, score, positive, caution=None):
        nonlocal total, available_weight
        available_weight += weight
        total += weight * score
        if positive:
            reasons.append(positive)
        elif caution:
            differences.append(caution)

    if all(value is not None for value in (a_min, a_max, b_min, b_max)):
        add(WEIGHTS["budget"], 1, "Your stated budget ranges overlap.")
    else:
        add(WEIGHTS["budget"], 0.65, "Budget looks potentially workable; at least one range needs detail.")

    if a_areas and b_areas:
        add(WEIGHTS["area"], 1, "You both selected " + ", ".join(sorted(shared_areas)) + ".")
    else:
        add(WEIGHTS["area"], 0.65, "Add preferred areas to make location matching more useful.")

    if days_apart is None:
        add(WEIGHTS["move_in"], 0.65, "Move-in timing needs a little more detail.")
    else:
        add(WEIGHTS["move_in"], max(0, 1 - days_apart / 30), "Your move-in dates are close." if days_apart <= 7 else None, "Your move-in dates differ by " + str(days_apart) + " days.")

    comparisons = [
        ("cleanliness", a.cleanliness, b.cleanliness, "Your cleanliness expectations are aligned.", "Your approaches to cleaning differ."),
        ("sleep_schedule", a.sleep_schedule, b.sleep_schedule, "Your sleep schedules are aligned.", "Your preferred sleep schedules differ."),
        ("guest_frequency", a.guest_frequency, b.guest_frequency, "Your guest expectations are aligned.", "Your preferred guest frequency differs."),
        ("smoking", a.smoking, b.smoking, "Your smoking preferences are aligned.", "Your smoking preferences differ."),
        ("pets", a.pets, b.pets, "Your pet preferences are aligned.", "Your pet preferences differ."),
        ("work_mode", a.work_mode, b.work_mode, "Your work/study routines are aligned.", "Your work/study routines differ."),
        ("noise_preference", a.noise_preference, b.noise_preference, "Your noise preferences are aligned.", "Your noise preferences differ."),
    ]
    for key, left, right, positive, caution in comparisons:
        if left in (None, "", 0) or right in (None, "", 0):
            continue
        if key == "cleanliness":
            try:
                score = max(0, 1 - abs(int(left) - int(right)) / 4)
            except (TypeError, ValueError):
                score = 0.5
        else:
            score = 1 if left == right else 0
        add(WEIGHTS[key], score, positive if score >= 0.8 else None, caution)

    score = round(total / available_weight * 100) if available_weight else None
    return {
        "score": score,
        "agreements": reasons,
        "differences": differences,
        "note": "Preference comparison only. Discuss differences before making a housing decision.",
    }
