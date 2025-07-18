import pandas as pd

# Load the Titanic dataset
df = pd.read_csv('/content/titanic.csv')

# Drop rows with any missing values
df.dropna(inplace=True)

# Display the cleaned dataset
print(df)

# 1. Total number of survivors
sc = df['Survived'].sum()
print("Number of customers who survived the Titanic accident:", sc)

# 2. Survivors who embarked from Queenstown (port 'Q')
Q_sc = df[(df['Survived'] == 1) & (df['Embarked'] == 'Q')].shape[0]
print("Number of customers who survived the Titanic accident and embarked from Queenstown, Ireland:", Q_sc)

# 3. Non-survivors under 20 years old
nsc = len(df[(df['Survived'] == 0) & (df['Age'] < 20)])
print("Number of customers who did not survive the Titanic accident and were less than 20 years old:", nsc)

# 4. Non-surviving males aged over 50 who embarked from Southampton or Cherbourg
mns = len(df[(df['Survived'] == 0) & (df['Age'] > 50) & (df['Sex'] == 'male') & 
             ((df['Embarked'] == 'S') | (df['Embarked'] == 'C'))])
print("Male passengers aged over 50 who did not survive and embarked from Southampton or Cherbourg:", mns)

# 5. Non-surviving females aged over 50 who embarked from Southampton or Cherbourg
fns = len(df[(df['Survived'] == 0) & (df['Age'] > 50) & (df['Sex'] == 'female') & 
             ((df['Embarked'] == 'S') | (df['Embarked'] == 'C'))])
print("Female passengers aged over 50 who did not survive and embarked from Southampton or Cherbourg:", fns)

# 6. Passengers who embarked from Southampton or Queenstown with family and did not survive
Q_nsc = len(df[((df['Embarked'] == 'S') | (df['Embarked'] == 'Q')) & 
               (df['Parch'] > 0) & (df['Survived'] == 0)])
print("Passengers who boarded from Southampton or Queenstown with family members and did not survive:", Q_nsc)
