package isa.spring.boot.pharmacy.model.users;

import isa.spring.boot.pharmacy.model.pharmacy.Subscription;
import isa.spring.boot.pharmacy.model.schedule.AppointmentHistory;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.List;

@Entity
@Table(name="patients")
@DiscriminatorValue("Patient")
public class Patient extends User {

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "user_category")
    private UserCategory userCategory;

    private AppointmentHistory appointmentHistory;
    private List<Allergy> allergies;
    private List<Subscription> subscriptions;

    public Patient() {
    }

    public Patient(String email, String password, String firstName, String lastName, String phoneNumber, int points,
                   UserCategory userCategory, AppointmentHistory appointmentHistory, List<Allergy> allergies, List<Subscription> subscriptions) {
        super(email, password, firstName, lastName, phoneNumber);
        this.points = points;
        this.userCategory = userCategory;
        this.appointmentHistory = appointmentHistory;
        this.allergies = allergies;
        this.subscriptions = subscriptions;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public UserCategory getUserCategory() {
        return userCategory;
    }

    public void setUserCategory(UserCategory userCategory) {
        this.userCategory = userCategory;
    }

    public AppointmentHistory getAppointmentHistory() {
        return appointmentHistory;
    }

    public void setAppointmentHistory(AppointmentHistory appointmentHistory) {
        this.appointmentHistory = appointmentHistory;
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }

    public void setAllergies(List<Allergy> allergies) {
        this.allergies = allergies;
    }

    public List<Subscription> getSubscriptions() {
        return subscriptions;
    }

    public void setSubscriptions(List<Subscription> subscriptions) {
        this.subscriptions = subscriptions;
    }
}
