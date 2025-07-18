import java.util.*;

interface Reservable {
    void reserveRoom(String customerName, int nights);
    void cancelReservation();
}

// Base Room class
class Room {
    protected int roomNumber;
    protected boolean isBooked;
    protected double price;
    protected String bookedBy;
    protected int nights;
    protected double finalPrice;
    protected List<Integer> ratings = new ArrayList<>();

    public Room(int roomNumber, double price) {
        this.roomNumber = roomNumber;
        this.price = price;
        this.isBooked = false;
        this.bookedBy = "";
    }

    public double calculatePrice(int nights, boolean applyDiscount) {
        double total = price * nights;
        if (applyDiscount) total *= 0.9; // 10% discount
        return total;
    }

    public void displayRoomInfo() {
        double avgRating = ratings.isEmpty() ? 0 : ratings.stream().mapToInt(i -> i).average().orElse(0);
        System.out.printf("Room %d | Price: $%.2f per night | Booked: %s | Rating: %.1f ⭐%n",
                roomNumber, price, (isBooked ? "Yes (by " + bookedBy + ")" : "No"), avgRating);
    }

    public void addRating(int rating) {
        ratings.add(rating);
    }

    public double getAverageRating() {
        return ratings.isEmpty() ? 0 : ratings.stream().mapToInt(i -> i).average().orElse(0);
    }
}

// Deluxe Room
class DeluxeRoom extends Room implements Reservable {
    public DeluxeRoom(int roomNumber) {
        super(roomNumber, 200.0);
    }

    @Override
    public void reserveRoom(String customerName, int nights) {
        if (!isBooked) {
            isBooked = true;
            bookedBy = customerName;
            this.nights = nights;
            boolean discount = LoyaltyProgram.getPoints(customerName) >= 50;
            finalPrice = calculatePrice(nights, discount);
            LoyaltyProgram.addPoints(customerName, 20);
            BookingHistory.addBooking(customerName, roomNumber, nights, finalPrice);
            System.out.printf("Deluxe Room %d booked by %s for %d nights. Total: $%.2f%n", roomNumber, customerName, nights, finalPrice);
        } else {
            System.out.println("Sorry, Deluxe Room is already booked.");
        }
    }

    @Override
    public void cancelReservation() {
        if (isBooked) {
            isBooked = false;
            bookedBy = "";
            System.out.println("Deluxe Room reservation cancelled.");
        } else {
            System.out.println("Deluxe Room is not booked.");
        }
    }
}

// Standard Room
class StandardRoom extends Room implements Reservable {
    public StandardRoom(int roomNumber) {
        super(roomNumber, 100.0);
    }

    @Override
    public void reserveRoom(String customerName, int nights) {
        if (!isBooked) {
            isBooked = true;
            bookedBy = customerName;
            this.nights = nights;
            boolean discount = LoyaltyProgram.getPoints(customerName) >= 50;
            finalPrice = calculatePrice(nights, discount);
            LoyaltyProgram.addPoints(customerName, 10);
            BookingHistory.addBooking(customerName, roomNumber, nights, finalPrice);
            System.out.printf("Standard Room %d booked by %s for %d nights. Total: $%.2f%n", roomNumber, customerName, nights, finalPrice);
        } else {
            System.out.println("Sorry, Standard Room is already booked.");
        }
    }

    @Override
    public void cancelReservation() {
        if (isBooked) {
            isBooked = false;
            bookedBy = "";
            System.out.println("Standard Room reservation cancelled.");
        } else {
            System.out.println("Standard Room is not booked.");
        }
    }
}

// Booking History
class BookingHistory {
    private static final List<String> history = new ArrayList<>();

    public static void addBooking(String customer, int room, int nights, double price) {
        history.add(customer + " booked Room " + room + " for " + nights + " nights ($" + price + ")");
    }

    public static void showHistory() {
        if (history.isEmpty()) System.out.println("No booking history.");
        else history.forEach(System.out::println);
    }
}

// Loyalty Program
class LoyaltyProgram {
    private static final Map<String, Integer> points = new HashMap<>();

    public static void addPoints(String customer, int pts) {
        points.put(customer, points.getOrDefault(customer, 0) + pts);
    }

    public static int getPoints(String customer) {
        return points.getOrDefault(customer, 0);
    }

    public static void showPoints(String customer) {
        System.out.println(customer + " has " + getPoints(customer) + " loyalty points.");
    }
}

// Hotel Reservation System
public class HotelReservationSystem {
    private static final List<Room> rooms = new ArrayList<>();
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        initializeRooms();
        System.out.println("Welcome to the Hotel Reservation System!");

        while (true) {
            System.out.println("\n1. View Rooms\n2. Book Room\n3. Cancel Booking\n4. Check Loyalty Points\n5. Booking History\n6. Rate Room\n7. Admin Dashboard\n8. Exit");
            System.out.print("Enter choice: ");
            int choice = scanner.nextInt();
            scanner.nextLine();

            switch (choice) {
                case 1 -> viewRooms();
                case 2 -> bookRoom();
                case 3 -> cancelBooking();
                case 4 -> checkLoyaltyPoints();
                case 5 -> BookingHistory.showHistory();
                case 6 -> rateRoom();
                case 7 -> adminDashboard();
                case 8 -> {
                    System.out.println("Exiting... Thank you!");
                    return;
                }
                default -> System.out.println("Invalid choice.");
            }
        }
    }

    private static void initializeRooms() {
        rooms.add(new DeluxeRoom(101));
        rooms.add(new DeluxeRoom(102));
        rooms.add(new StandardRoom(201));
        rooms.add(new StandardRoom(202));
    }

    private static void viewRooms() {
        rooms.forEach(Room::displayRoomInfo);
    }

    private static void bookRoom() {
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.print("Enter Room Number: ");
        int roomNumber = scanner.nextInt();

        System.out.print("Enter nights: ");
        int nights = scanner.nextInt();

        for (Room room : rooms) {
            if (room.roomNumber == roomNumber && room instanceof Reservable) {
                ((Reservable) room).reserveRoom(name, nights);
                return;
            }
        }
        System.out.println("Invalid Room Number.");
    }

    private static void cancelBooking() {
        System.out.print("Enter Room Number: ");
        int roomNumber = scanner.nextInt();

        rooms.stream()
             .filter(room -> room.roomNumber == roomNumber && room instanceof Reservable)
             .forEach(room -> ((Reservable) room).cancelReservation());
    }

    private static void checkLoyaltyPoints() {
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        LoyaltyProgram.showPoints(name);
    }

    private static void rateRoom() {
        System.out.print("Enter Room Number: ");
        int roomNumber = scanner.nextInt();

        System.out.print("Enter Rating (1-5): ");
        int rating = scanner.nextInt();

        rooms.stream()
             .filter(room -> room.roomNumber == roomNumber)
             .forEach(room -> room.addRating(rating));

        System.out.println("Rating submitted!");
    }

    private static void adminDashboard() {
        double revenue = rooms.stream().mapToDouble(room -> room.finalPrice).sum();
        System.out.println("Total Revenue: $" + revenue);
    }
}
