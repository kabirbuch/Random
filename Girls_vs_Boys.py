def countusage(childlist: str) -> tuple:
    """
    Given an ordering of children, how many girls are there and how many boys?
    """
    g_used: int = 0
    b_used: int = 0
    for kid in childlist:
        if kid == "G":
            g_used += 1
        else:
            b_used += 1
    return (g_used, b_used)

def kidgenerator(n: int) -> list:
    """
    If a couple has exactly n kids and stops at any point in which they have 
    more girls than boys, what orderings of girls and boys could they have?
    """
    working: list[str] = []
    possibilities: list[str] = [""]

    for a in range(n):
        for possibility in possibilities:
            g_used, b_used = countusage(possibility)
            g_available: int = (n // 2) + 1 - b_used
            b_available: int = n // 2 - b_used
            if b_available:
                working.append(possibility + "B")
            if (g_available and g_used < b_used) or a == n - 1:
                working.append(possibility + "G")
        possibilities = working
        working = []

    return possibilities

def ev(n: int) -> int:
    """
    If a couple has n or less kids and stops at any point in which they have
    more girls than boys, what is the expected amount of girls they have? I'm
    unsure if this implementation captures the right answer.
    """
    possibilities: list[str] = []
    outcomespace: int = 0
    for a in range(1, n + 1, 2):
        thisnumber: list = kidgenerator(a)
        possibilities += thisnumber
        outcomespace += len(thisnumber) / 2**a
    ans: int = 0

    for possibility in possibilities:
        ans += countusage(possibility)[0] / (2**len(possibility) * outcomespace)

    return ans

def convergencetest(n: int) -> None:
    """
    Checking whether the change of ev(n) is decreasing
    """
    start: int = ev(1)
    for a in range(3, n + 1, 2):
        print(f"From {a - 2} to {a}, EV went from {start} to {ev(a)}. Delta was {ev(a) - start}")
        start = ev(a)
