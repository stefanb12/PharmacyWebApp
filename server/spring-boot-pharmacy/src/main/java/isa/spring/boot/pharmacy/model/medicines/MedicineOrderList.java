package isa.spring.boot.pharmacy.model.medicines;

import isa.spring.boot.pharmacy.model.pharmacy.Pharmacy;
import isa.spring.boot.pharmacy.model.users.PharmacyAdministrator;

import javax.persistence.*;

import java.util.Date;
import java.util.List;

import static javax.persistence.InheritanceType.SINGLE_TABLE;

@Entity
@Table(name="medicine_order_lists")
public class MedicineOrderList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id", unique=true, nullable=false)
    private Long id;

    @Column(name = "final_offer_date", nullable = false)
    private Date finalOfferDate;

    @Column(name = "deleted", nullable = false)
    private Boolean deleted;

    @OneToMany(mappedBy = "medicineOrderList", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Pharmacy pharmacy;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private PharmacyAdministrator pharmacyAdministrator;

    // ***
    @OneToMany(mappedBy = "medicineOrderList", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Offer> offers;

    public MedicineOrderList() {
    }

    public MedicineOrderList(Date finalOfferDate, List<OrderItem> orderItems, Pharmacy pharmacy, PharmacyAdministrator pharmacyAdministrator, Boolean deleted) {
        this.finalOfferDate = finalOfferDate;
        this.orderItems = orderItems;
        this.pharmacy = pharmacy;
        this.pharmacyAdministrator = pharmacyAdministrator;
        this.deleted = deleted;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFinalOfferDate() {
        return finalOfferDate;
    }

    public void setFinalOfferDate(Date finalOfferDate) {
        this.finalOfferDate = finalOfferDate;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public Pharmacy getPharmacy() { return pharmacy; }

    public void setPharmacy(Pharmacy pharmacy) { this.pharmacy = pharmacy; }

    public List<Offer> getOffers() {
        return offers;
    }

    public void setOffers(List<Offer> offers) {
        this.offers = offers;
    }

    public PharmacyAdministrator getPharmacyAdministrator() {
        return pharmacyAdministrator;
    }

    public void setPharmacyAdministrator(PharmacyAdministrator pharmacyAdministrator) {
        this.pharmacyAdministrator = pharmacyAdministrator;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }
}
