import numpy as np
import math

def perlin_noise(x, y, octaves=4, persistence=0.5):
  """
  Generates Perlin noise at a given position.

  Args:
      x: X coordinate.
      y: Y coordinate.
      octaves: Number of octaves to sum for increased detail.
      persistence: How much each successive octave contributes.

  Returns:
      A float between 0 and 1 representing the noise value.
  """
  noise = 0.0
  for i in range(octaves):
    frequency = 2 ** i
    amplitude = persistence ** i
    xi = x / frequency
    yi = y / frequency
    smooth = interpolate(perlin_hash(xi), perlin_hash(xi + 1), xi)
    noise += smooth * interpolate(perlin_hash(yi), perlin_hash(yi + 1), yi) * amplitude
    noise = noise % 2.0
    noise = math.floor(noise)
  return noise

def interpolate(a, b, x):
  """
  Linearly interpolates between a and b based on x (0-1).
  """
  return a + (b - a) * x

def perlin_hash(x):
  """
  Simple hash function for Perlin noise. (Replace with a better one for production)
  """
  return x % 256

# Generate a 32x32 array of noise values
noise_array = np.zeros((32, 32))
for i in range(1, 33):
  for j in range(1, 33):
    noise_array[i-1, j-1] = perlin_noise(i, j)

# You can now use the noise_array for your purposes (e.g., terrain generation)



# Print or use the noise_array for further processing
np.set_printoptions(threshold=np.inf)
print(noise_array)

for i in range(32):
  for j in range(32):
    print(noise_array[i][j], end = " ")
