# Information about Abraham
name = "Abraham"
nickname = "veneko"
age = 16
bank_balance = 20 # Balance in dollars

print("My name is: {Abraham}")
# Your name
name = "Abraham"
# Use a loop to go through the letters of the name
print("Letters in your name:")
for letter in name:
    print(letter)

    

# Display the information
def display_info():
    print("User Information:")
    print(f"Name: {name}")
    print(f"Nickname: {nickname}")
    print(f"Age: {age}")
    print(f"Bank Account Balance: ${bank_balance:.2f}")

#making a decision depemnding on my bank balance

if bank_balance < 10:
    print("YOU ARE POOR!!!!!!!")

elif bank_balance > 10:
        print("You are still being poor but you got some money!")

# Run the function to show the info
display_info()

