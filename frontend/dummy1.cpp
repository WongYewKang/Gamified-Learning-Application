#include <iostream>
#include <iomanip>
using namespace std;

#define MAX_NUMBERS 50
#define MAX_VALUE 10

int main() {
    int numbers[MAX_NUMBERS];
    int frequency[MAX_VALUE + 1] = {0};  // Frequency array for counting occurrences
    int totalNumbers = 0;
    int inputNumber;

    //Section A
    cout << "Please enter integers between 0 and 10 (press Ctrl + Z to stop):\n";
    
    while (totalNumbers < MAX_NUMBERS && cin >> inputNumber) {
        if (inputNumber >= 0 && inputNumber <= 10) {
            numbers[totalNumbers] = inputNumber;
            frequency[inputNumber]++;
            totalNumbers++;
        } else {
            cout << "Invalid input. Please enter a number between 0 and 10.\n";
        }
    }

    // Display the total number of data points read
    cout << "\nTotal numbers entered: " << totalNumbers << endl;

    // Section B: Display the numbers vertically
    cout << "\nA = 10\n";  // Axis label for 10
    cout << "Numbers plotted vertically:\n";

    int minIndex = 0;
    int maxIndex = 0;

    // Find the indices of the minimum and maximum values
    for (int i = 1; i < totalNumbers; i++) {
        if (numbers[i] < numbers[minIndex]) {
            minIndex = i;
        }
        if (numbers[i] > numbers[maxIndex]) {
            maxIndex = i;
        }
    }

    for (int i = 0; i < totalNumbers; i++) {
        if (i == minIndex) {
            cout << numbers[i] << " <\n";  // Mark the minimum value
        } else if (i == maxIndex) {
            cout << numbers[i] << " >\n";  // Mark the maximum value
        } else {
            cout << numbers[i] << endl;
        }
    }

    // Section C: Display the horizontal histogram
    cout << "\nHorizontal Histogram:\n";

    for (int value = 0; value <= MAX_VALUE; value++) {
        cout << value << " | ";  // Axis label
        for (int star = 0; star < frequency[value]; star++) {
            cout << "*";  // Plot stars for each occurrence
        }
        cout << endl;
    }

    return 0;
}
