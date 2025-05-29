def two_pose_rele(x, a):
    return a if x > 0 else -a

def three_pose_rele(x, a, b):
    if x > b:
        return a
    elif abs(x) <= b:
        return 0
    elif x < -b:
        return -a


def amplifier_with_saturation(x, a, b, K):
    if abs(x) <= b:
        return K * x
    elif x > b:
        return a
    elif x < -b:
        return -a
    else:
        return 0

def amplifier_with_insensitivity(x, a, b, K):
    if x > b:
        return K * (x - b)
    elif abs(x) <= b:
        return 0
    elif x < -b:
        return K * (x + b)

def amplifier_with_saturation_and_insensitivity(x, a, b, c, K):
    if x > c:
        return a
    elif b < x <= c:
        return K * (x - b)
    elif -b <= x <= b:
        return 0
    elif -c <= x < -b:
        return K * (x + b)
    elif x < -c:
        return -a

def rele_with_histeresis(x, dx_dt, a, b):
    if dx_dt > 0:
        return a if x > b else -a
    elif dx_dt < 0:
        return a if x > -b else -a

def luft(x, dx_dt, K, b):
    if dx_dt > 0:
        return K * (x - b)
    elif dx_dt < 0:
        return K * (x + b)

def rele_with_insensetivity_and_hysteresis(x, dx_dt, a, b, c, K):
    if dx_dt > 0:
        if x > c:
            return a
        elif -b <= x <= c:
            return 0
        elif x < -b:
            return -a
    elif dx_dt < 0:
        if x > b:
            return a
        elif -c <= x <= b:
            return 0
        elif x < -c:
            return -a