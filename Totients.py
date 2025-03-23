import math
import timeit

def totient_rationals(n: int) -> int:
    """
    Given a number n, how many rational numbers in [0, 1] can be expressed in
    lowest terms p / q, where q <= N? This is the brute force method
    """

    ans = 1 # Start at one in order to include (0 / 1)
    for a in range(1, n + 1):
        for b in range(1, a + 1):
            if math.gcd(a, b) == 1:
                ans += 1

    return ans

def tot_rats(n: int) -> int:
    """
    Given a number N, how many rational numbers in [0, 1] can be expressed in
    lowest terms p / q, where q <= N?
    """

    potential = {}
    ans = 0

    for a in range(1, n + 1):
        add = potential.get(a, a + 1) # Numbers with q == a
        ans += add
        for b in range(2*a, n + 1, a):
            potential[b] = potential.get(b, b + 1) - add

    return ans

def time_slow(n: int) -> int:
    start = timeit.default_timer()
    totient_rationals(n)
    stop = timeit.default_timer()
    return stop - start

def time_fast(n: int) -> int:
    start = timeit.default_timer()
    tot_rats(n)
    stop = timeit.default_timer()
    return stop - start

def test(n):
    print(f"For N = {n}, our function is {int(time_slow(n) // time_fast(n))} times faster")
