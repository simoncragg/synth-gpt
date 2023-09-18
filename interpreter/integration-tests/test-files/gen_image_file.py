import io
import matplotlib.pyplot as plt

data = [(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]

x, y = zip(*data)

plt.figure(figsize=(6, 6))
plt.plot(x, y, marker="o", linestyle="-")
plt.title("Line Chart")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)

bytes_io = io.BytesIO()
plt.savefig(bytes_io, format="png")
bytes_io.seek(0)

result = bytes_io
