type HelpItem = {
  solutionCode: string;
  explanation: string;
};

const helpByTitle: Record<string, HelpItem> = {
  'Prime Number with Invalid Input Handling': {
    solutionCode: `value = input().strip()
try:
    n = int(value)
    if n < 2:
        print("NOT PRIME")
    else:
        prime = True
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                prime = False
                break
        print("PRIME" if prime else "NOT PRIME")
except ValueError:
    print("INVALID")
`,
    explanation: 'Convert input inside try-except so invalid values do not crash. A number is prime only when it is at least 2 and has no divisor up to its square root.'
  },
  'Script Mode Message Formatter': {
    solutionCode: `filename = input().strip()
message = input().strip()
print(f"Saved to {filename}: {message}")
`,
    explanation: 'Read the filename and message separately, then format the output exactly as the problem asks.'
  },
  'Dynamic Typing Type Reporter': {
    solutionCode: `values = [input().strip() for _ in range(3)]
for value in values:
    if value in ("True", "False"):
        print("bool")
    else:
        try:
            int(value)
            print("int")
        except ValueError:
            try:
                float(value)
                print("float")
            except ValueError:
                print("str")
`,
    explanation: 'Check boolean text first, then try integer conversion, then float conversion. If all conversions fail, the value is treated as a string.'
  },
  'Sum Only Integers from Mixed List': {
    solutionCode: `n = int(input())
tokens = input().split() if n else []
total = 0
for token in tokens:
    try:
        total += int(token)
    except ValueError:
        pass
print(total)
`,
    explanation: 'Loop through every token and use try-except. Integer tokens are added; non-integer tokens are ignored gracefully.'
  },
  'Vowels in Each Word Dictionary': {
    solutionCode: `sentence = input().strip()
vowels = set("aeiouAEIOU")
seen = {}
for word in sentence.split():
    if word not in seen:
        seen[word] = sum(1 for ch in word if ch in vowels)
for word, count in seen.items():
    print(word, count)
`,
    explanation: 'Split the sentence into words, count vowels for each first-time word, and print in first appearance order.'
  },
  'Identifier Email or URL Validator': {
    solutionCode: `s = input().strip()
if s.startswith("http://") or s.startswith("https://"):
    print("URL")
elif s.count("@") == 1 and "." in s.split("@")[1]:
    print("EMAIL")
elif s.isidentifier():
    print("IDENTIFIER")
else:
    print("INVALID")
`,
    explanation: 'Classify URL and email patterns first, then use Python string method isidentifier() for valid identifiers.'
  },
  'Character Type Counter': {
    solutionCode: `s = input()
digits = alphabets = whitespaces = special = 0
for ch in s:
    if ch.isdigit():
        digits += 1
    elif ch.isalpha():
        alphabets += 1
    elif ch.isspace():
        whitespaces += 1
    else:
        special += 1
print(digits, alphabets, whitespaces, special)
`,
    explanation: 'Each character belongs to exactly one group: digit, alphabet, whitespace, or special character.'
  },
  'Prime Numbers from a List': {
    solutionCode: `n = int(input())
tokens = input().split() if n else []

def is_prime(num):
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

primes = []
for token in tokens:
    try:
        value = int(token)
        if is_prime(value):
            primes.append(str(value))
    except ValueError:
        pass
print(" ".join(primes) if primes else "NONE")
`,
    explanation: 'Ignore non-integer tokens, test each integer using a helper function, and print NONE when no prime numbers are found.'
  },
  'Simple Calculator with Exceptions': {
    solutionCode: `a, b, op = input().split()
a = float(a)
b = float(b)
if op == "+":
    ans = a + b
elif op == "-":
    ans = a - b
elif op == "*":
    ans = a * b
elif op == "/":
    if b == 0:
        print("DIVISION BY ZERO")
        raise SystemExit
    ans = a / b
else:
    print("INVALID OPERATOR")
    raise SystemExit
print(int(ans) if ans == int(ans) else ans)
`,
    explanation: 'Use if-elif-else for each operator. Division by zero and invalid operators must be handled before printing the result.'
  },
  'Word Count Dictionary': {
    solutionCode: `sentence = input().strip().lower()
for mark in ".,!?":
    sentence = sentence.replace(mark, "")
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
for word in sorted(counts):
    print(word, counts[word])
`,
    explanation: 'Clean punctuation, convert to lowercase, count words in a dictionary, and print alphabetically.'
  },
  'String Operations and Palindrome': {
    solutionCode: `s = input().strip()
vowels = sum(1 for ch in s if ch.lower() in "aeiou")
clean = "".join(ch.lower() for ch in s if ch != " ")
print(s.upper())
print(vowels)
print("YES" if clean == clean[::-1] else "NO")
`,
    explanation: 'Use string methods for uppercase, count vowels with a loop, and compare the cleaned string with its reverse for palindrome.'
  },
  'Number Report Even Factorial Prime': {
    solutionCode: `n = int(input())
print("EVEN" if n % 2 == 0 else "ODD")
fact = 1
for i in range(2, n + 1):
    fact *= i
print(fact)
prime = n >= 2
for i in range(2, int(n ** 0.5) + 1):
    if n % i == 0:
        prime = False
        break
print("PRIME" if prime else "NOT PRIME")
`,
    explanation: 'The answer combines three tasks: parity using modulo, factorial using a loop, and prime checking using divisibility.'
  },
  'Student Class Display': {
    solutionCode: `class Student:
    def __init__(self, name, roll, marks):
        self.name = name
        self.roll = roll
        self.marks = marks

    def display(self):
        print(self.roll, self.name, self.marks)

n = int(input())
students = []
for _ in range(n):
    name, roll, marks = input().split()
    students.append(Student(name, roll, marks))
for student in students:
    student.display()
`,
    explanation: 'Create a class with instance variables and a display method. Store objects in a list and call display for each object.'
  },
  'Circle Class Area': {
    solutionCode: `class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius * self.radius

r = float(input())
circle = Circle(r)
print(f"{circle.area():.2f}")
`,
    explanation: 'The radius is stored in the object. The area method returns pi times radius squared, rounded during printing.'
  },
  'Employee Class Raise': {
    solutionCode: `class Employee:
    company_name = ""

    def __init__(self, emp_id, name, salary):
        self.emp_id = emp_id
        self.name = name
        self.salary = salary

    def apply_raise(self, percent):
        self.salary = int(self.salary + self.salary * percent / 100)

company = input().strip()
Employee.company_name = company
n = int(input())
employees = []
for _ in range(n):
    emp_id, name, salary = input().split()
    employees.append(Employee(emp_id, name, int(salary)))
percent = int(input())
for emp in employees:
    emp.apply_raise(percent)
    print(emp.emp_id, emp.name, emp.salary)
`,
    explanation: 'Use a class variable for company name and instance variables for each employee. Apply the percentage raise to every object.'
  },
  'Animal Sound Polymorphism': {
    solutionCode: `class Animal:
    def sound(self):
        return "Unknown"

class Dog(Animal):
    def sound(self):
        return "Bark"

class Cat(Animal):
    def sound(self):
        return "Meow"

n = int(input())
names = input().split()
for name in names:
    obj = Dog() if name == "Dog" else Cat() if name == "Cat" else Animal()
    print(obj.sound())
`,
    explanation: 'Dog and Cat override the same sound method. Calling sound on different objects demonstrates polymorphism.'
  },
  'Bank Account Transactions': {
    solutionCode: `class Account:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount

account = Account(int(input()))
n = int(input())
for _ in range(n):
    kind, amount = input().split()
    amount = int(amount)
    if kind == "D":
        account.deposit(amount)
    else:
        account.withdraw(amount)
print(account.balance)
`,
    explanation: 'Deposit always increases balance. Withdrawal is performed only when enough balance is available.'
  },
  'Rectangle and Cuboid Inheritance': {
    solutionCode: `class Rectangle:
    def __init__(self, length, breadth):
        self.length = length
        self.breadth = breadth

    def area(self):
        return self.length * self.breadth

    def perimeter(self):
        return 2 * (self.length + self.breadth)

class Cuboid(Rectangle):
    def __init__(self, length, breadth, height):
        super().__init__(length, breadth)
        self.height = height

    def surface_area(self):
        return 2 * (self.length * self.breadth + self.breadth * self.height + self.length * self.height)

    def volume(self):
        return self.length * self.breadth * self.height

l, b, h = map(int, input().split())
c = Cuboid(l, b, h)
print(c.area())
print(c.perimeter())
print(c.surface_area())
print(c.volume())
`,
    explanation: 'Cuboid inherits length, breadth, area, and perimeter behavior from Rectangle, then adds height-based methods.'
  },
  'Datetime Days Remaining': {
    solutionCode: `from datetime import date
today = date.fromisoformat(input().strip())
target = date.fromisoformat(input().strip())
print((target - today).days)
`,
    explanation: 'Convert both ISO date strings to date objects. Subtracting dates gives a timedelta whose days value is the answer.'
  },
  'Leap Years Between Years': {
    solutionCode: `import calendar
start, end = map(int, input().split())
years = [str(year) for year in range(start, end + 1) if calendar.isleap(year)]
print(" ".join(years) if years else "NONE")
`,
    explanation: 'The calendar module has isleap(), so check every year in the inclusive range and print matching years.'
  },
  'All Mondays in a Month': {
    solutionCode: `import calendar
month, year = map(int, input().split())
for week in calendar.monthcalendar(year, month):
    day = week[calendar.MONDAY]
    if day:
        print(f"{day:02d}-{month:02d}-{year}")
`,
    explanation: 'monthcalendar returns weeks. Monday is at index calendar.MONDAY; non-zero values are actual dates.'
  },
  'Square Root Using Math Module': {
    solutionCode: `import math
x = float(input())
print(f"{math.sqrt(x):.2f}")
`,
    explanation: 'Use math.sqrt() to calculate the square root and format the result to two decimal places.'
  },
  'Even Numbers Mean and Standard Deviation': {
    solutionCode: `n = int(input())
values = [2 * i for i in range(1, n + 1)]
mean = sum(values) / n
variance = sum((x - mean) ** 2 for x in values) / n
print(f"{mean:.2f} {variance ** 0.5:.2f}")
`,
    explanation: 'Generate the first n positive even numbers. Population standard deviation uses variance divided by n.'
  },
  'Matrix Row and Column Sums': {
    solutionCode: `matrix = [list(map(int, input().split())) for _ in range(4)]
row_sums = [sum(row) for row in matrix]
col_sums = [sum(matrix[r][c] for r in range(4)) for c in range(4)]
print(*row_sums)
print(*col_sums)
`,
    explanation: 'Row sums come from each row. Column sums are calculated by fixing the column index and adding all rows.'
  },
  'CSV Student Marks Formatter': {
    solutionCode: `import csv
import sys
n = int(input())
reader = csv.reader(sys.stdin)
for index, row in enumerate(reader):
    if index == n:
        break
    print(f"{row[0]}: {row[1]}")
`,
    explanation: 'Use csv.reader to split comma-separated rows safely, then print the required formatted output.'
  },
  'CSV Sales Total': {
    solutionCode: `import csv
import sys
n = int(input())
reader = csv.reader(sys.stdin)
total = 0
for index, row in enumerate(reader):
    if index == n:
        break
    total += int(row[1])
print(f"Total,{total}")
`,
    explanation: 'Read each CSV row, add the amount column, and print the total in the requested CSV-style format.'
  },
  'Filter Rows Above Threshold': {
    solutionCode: `threshold = int(input())
n = int(input())
names = []
for _ in range(n):
    name, value = input().split(",")
    if int(value) > threshold:
        names.append(name)
print("\\n".join(names) if names else "NONE")
`,
    explanation: 'Parse each name,value row and keep only rows where the numeric value is greater than the threshold.'
  },
  'Missing Value Counts': {
    solutionCode: `rows, cols = map(int, input().split())
header = input().split(",")
counts = [0] * cols
for _ in range(rows):
    parts = input().split(",")
    while len(parts) < cols:
        parts.append("")
    for i, value in enumerate(parts):
        if value == "" or value == "NA":
            counts[i] += 1
for name, count in zip(header, counts):
    if count:
        print(name, count)
`,
    explanation: 'Treat empty cells and NA as missing. Count missing values column-wise and print only columns with missing data.'
  },
  'Missing Value Percentage': {
    solutionCode: `rows, cols = map(int, input().split())
header = input().split(",")
counts = [0] * cols
for _ in range(rows):
    parts = input().split(",")
    while len(parts) < cols:
        parts.append("")
    for i, value in enumerate(parts):
        if value == "" or value == "NA":
            counts[i] += 1
for name, count in zip(header, counts):
    print(f"{name} {count * 100 / rows:.2f}")
`,
    explanation: 'Count missing cells for each column, divide by total rows, and multiply by 100 to get percentage.'
  },
  'Mean Median Standard Deviation': {
    solutionCode: `n = int(input())
values = list(map(float, input().split()))
values.sort()
mean = sum(values) / n
if n % 2:
    median = values[n // 2]
else:
    median = (values[n // 2 - 1] + values[n // 2]) / 2
variance = sum((x - mean) ** 2 for x in values) / n
print(f"{mean:.2f} {median:.2f} {variance ** 0.5:.2f}")
`,
    explanation: 'Mean is average, median is the middle value after sorting, and population standard deviation uses variance divided by n.'
  },
  'Top Five Values in Column': {
    solutionCode: `n = int(input())
values = list(map(int, input().split()))
print(*sorted(values, reverse=True)[:5])
`,
    explanation: 'Sort values in descending order and take the first five values.'
  },
  'Most Frequent Category': {
    solutionCode: `n = int(input())
categories = input().split()
counts = {}
for item in categories:
    counts[item] = counts.get(item, 0) + 1
best = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[0][0]
print(best)
`,
    explanation: 'Count every category. Sorting by negative count and then name handles ties alphabetically.'
  },
  'Outliers Using IQR Method': {
    solutionCode: `n = int(input())
values = list(map(float, input().split()))

def median(nums):
    nums = sorted(nums)
    m = len(nums)
    if m % 2:
        return nums[m // 2]
    return (nums[m // 2 - 1] + nums[m // 2]) / 2

sorted_values = sorted(values)
lower = sorted_values[:n // 2]
upper = sorted_values[(n + 1) // 2:]
q1 = median(lower)
q3 = median(upper)
iqr = q3 - q1
low = q1 - 1.5 * iqr
high = q3 + 1.5 * iqr
outliers = [x for x in values if x < low or x > high]
print(" ".join(str(int(x)) if x == int(x) else str(x) for x in outliers) if outliers else "NONE")
`,
    explanation: 'Find Q1 and Q3 using median-of-halves, calculate IQR, then values outside Q1-1.5*IQR and Q3+1.5*IQR are outliers.'
  },
  'Label Encoding Categories': {
    solutionCode: `n = int(input())
items = input().split()
labels = {value: index for index, value in enumerate(sorted(set(items)))}
print(" ".join(str(labels[item]) for item in items))
`,
    explanation: 'Label encoding assigns numeric labels to sorted unique categories, then prints labels in original order.'
  },
  'Correlation Between Two Columns': {
    solutionCode: `n = int(input())
x = list(map(float, input().split()))
y = list(map(float, input().split()))
mx = sum(x) / n
my = sum(y) / n
num = sum((a - mx) * (b - my) for a, b in zip(x, y))
den_x = sum((a - mx) ** 2 for a in x) ** 0.5
den_y = sum((b - my) ** 2 for b in y) ** 0.5
print(f"{num / (den_x * den_y):.2f}")
`,
    explanation: 'Pearson correlation divides covariance by the product of the two standard deviation terms.'
  }
};

export function getQuestionHelp(title: string): HelpItem {
  return (
    helpByTitle[title] || {
      solutionCode: '# Reference solution is not available for this custom question yet.\\n',
      explanation: 'This is a custom/admin-created question. Ask the admin to add a reference solution for this problem.'
    }
  );
}
