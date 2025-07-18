import random

def print_board(b):

    for r in range(9):
        if r % 3 == 0 and r != 0:
            print("-" * 21)
        for c in range(9):
            if c % 3 == 0 and c != 0:
                print("|", end=" ")
            print(b[r][c] if b[r][c] != 0 else '.', end=" ")
        print()

def is_valid(b, r, c, n):
    if n in b[r]:
        return False
    if n in (b[rr][c] for rr in range(9)):
        return False
    start_r, start_c = 3 * (r // 3), 3 * (c // 3)
    for rr in range(start_r, start_r + 3):
        for cc in range(start_c, start_c + 3):
            if b[rr][cc] == n:
                return False
    return True

def find_empty(b):
    for r in range(9):
        for c in range(9):
            if b[r][c] == 0:
                return r, c
    return None

def solve(b):
    loc = find_empty(b)
    if not loc:
        return True

    r, c = loc
    for n in range(1, 10):
        if is_valid(b, r, c, n):
            b[r][c] = n
            if solve(b):
                return True
            b[r][c] = 0
    return False

def generate_puzzle():
    base = 3
    side = base * base
    def pattern(r, c): return (base * (r % base) + r // base + c) % side
    def shuffle(s): return random.sample(s, len(s))
    r_base = range(base)
    rows = [g * base + r for g in shuffle(r_base) for r in shuffle(r_base)]
    cols = [g * base + c for g in shuffle(r_base) for c in shuffle(r_base)]
    nums = shuffle(range(1, base * base + 1))
    b = [[nums[pattern(r, c)] for c in cols] for r in rows]
    squares = side * side
    empties = squares * 3 // 4
    for p in random.sample(range(squares), empties):
        b[p // side][p % side] = 0
    return b

sudoku = generate_puzzle()
print_board(sudoku)


print("\nSolving Sudoku...")
if solve(sudoku):
    print("\nSolved Sudoku Board :\n")
    print_board(sudoku)
else:
    print("No solution exists.")
