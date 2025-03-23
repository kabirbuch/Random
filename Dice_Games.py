def dicecombos(dice: int, maxsum: int) -> int:
    """
    Given a number of dice and a number, find how many ways the dice could be
    rolled to sum to that number.
    """

    if not dice <= maxsum <= 6*dice:
        return 0
    if dice == 1:
        return 1
    result: int = 0
    for n in range(maxsum - 6, maxsum):
        result += dicecombos(dice - 1, n)

    return result


def dice_probability(dice: int, maxsum: int) -> int:
    return f"{100*dicecombos(dice, maxsum) / (6**dice)}%"


def nosubsum(dice: int, subdice: int, maxsum: int) -> list[list[int]]:
    """
    How many ways can you roll n dice such that no permutation of
    size m subdice has a sum above a particular value?
    """

    outcomes: list[list[int]] = []

    if dice == 1:
        for n in range(min(6, maxsum - subdice + 1)):
            outcomes.append([n+1])
        return outcomes

    workingresult: list[list[int]] = nosubsum(dice - 1, subdice, maxsum)

    for roll in workingresult:
        maxcalculator = roll[:]
        maxsum = 0
        for n in range(min(len(roll), subdice - 1)):
            maxsum += max(maxcalculator)
            maxcalculator.remove(max(maxcalculator))
        for n in range(min(6, maxsum - max((subdice - 1), maxsum))):
            outcomes.append(roll + ([n + 1]))

    return outcomes

def rollconstructor(dice: int) -> list[list[int]]:
    """
    Return all possible rolls given 3 dice
    """

    if dice == 0:
        return []
    if dice == 1:
        outcomespace: list[list[int]] = []
        for n in range(6):
            outcomespace.append([n+1])
        return outcomespace

    outcomespace: list[list[int]] = []
    for _ in range(6):
        outcomespace.extend(rollconstructor(dice - 1)[:])

    for i, n in enumerate(outcomespace):
        n.insert(0, i // (len(outcomespace) // 6) + 1)

    return outcomespace

def nosub(dice: int, subdice: int, maxsum: int) -> list[list[int]]:
    """
    How many ways can you roll n dice such that no permutation of
    size m subdice has a sum above a particular value? This is the brute force
    method
    """

    assert dice >= subdice

    initoutcomes: list[list[int]] = rollconstructor(dice)
    finaloutcomes: list[list[int]] = []

    for roll in initoutcomes:
        maxsubsum: int = 0
        copy: list[int] = roll[:]
        for _ in range(subdice):
            maxsubsum += max(copy)
            copy.remove(max(copy))
        if maxsubsum <= maxsum:
            finaloutcomes.append(roll)

    return finaloutcomes
