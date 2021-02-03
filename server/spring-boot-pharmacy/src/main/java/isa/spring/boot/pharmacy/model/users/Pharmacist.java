package isa.spring.boot.pharmacy.model.users;

import isa.spring.boot.pharmacy.model.pharmacy.Pharmacy;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name="pharmacists")
@DiscriminatorValue("PHARMACIST")
public class Pharmacist extends Employee {

    @Column(name = "average_grade")
    private double averageGrade;

    // ***
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Pharmacy pharmacy;

    @OneToMany(mappedBy = "pharmacist", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PharmacistComplaint> complaints;

    public Pharmacist() {
    }

    public Pharmacist(String email, String password, String firstName, String lastName, String phoneNumber, Address address, double averageGrade) {
        super(email, password, firstName, lastName, phoneNumber, address);
        this.averageGrade = averageGrade;
    }

    public Pharmacy getPharmacy() {
        return pharmacy;
    }

    public void setPharmacy(Pharmacy pharmacy) {
        this.pharmacy = pharmacy;
    }

    public double getAverageGrade() {
        return averageGrade;
    }

    public void setAverageGrade(double averageGrade) {
        this.averageGrade = averageGrade;
    }

    public List<PharmacistComplaint> getComplaints() {
        return complaints;
    }

    public void setComplaints(List<PharmacistComplaint> complaints) {
        this.complaints = complaints;
    }
}
