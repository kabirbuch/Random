from datetime import datetime

def recursive(n: int) -> int:
    if n < 2:
        return n
    return recursive(n - 1) + recursive(n - 2)

def iterative(n: int) -> int:
    prev = 1
    answer = 0
    for _ in range(n):
        prevstore = answer
        answer += prev
        prev = prevstore
    return answer        

def time(n: int) -> int:
    start_time = datetime.now()
    iterative(n)
    end_time = datetime.now()
    print(end_time - start_time)



