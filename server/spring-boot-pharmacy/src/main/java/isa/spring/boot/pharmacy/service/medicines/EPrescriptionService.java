package isa.spring.boot.pharmacy.service.medicines;

import isa.spring.boot.pharmacy.exceptions.InvalidMedicineAmountException;
import isa.spring.boot.pharmacy.model.medicines.EPrescription;
import isa.spring.boot.pharmacy.model.medicines.EPrescriptionItem;
import isa.spring.boot.pharmacy.model.medicines.EPrescriptionState;
import isa.spring.boot.pharmacy.model.schedule.Appointment;
import isa.spring.boot.pharmacy.model.users.Patient;
import isa.spring.boot.pharmacy.repository.medicines.EPrescriptionRepository;
import isa.spring.boot.pharmacy.service.email.EmailService;
import isa.spring.boot.pharmacy.service.pharmacy.PharmacyService;
import isa.spring.boot.pharmacy.service.users.LoyaltyProgramService;
import isa.spring.boot.pharmacy.service.users.UserService;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Service
public class EPrescriptionService {

    @Autowired
    private EPrescriptionRepository ePrescriptionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PharmacyService pharmacyService;

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PharmacyMedicineService pharmacyMedicineService;

    @Autowired
    private LoyaltyProgramService loyaltyProgramService;

    public EPrescription createEPrescription(EPrescription ePrescription, Long patientId, Long pharmacyId,
                                             HashMap<String, Integer> codesWithQuantities) {
        if (userService.getPenaltiesByPatientId(patientId) > 2) {
            return null;
        }
        ePrescription.setPharmacy(pharmacyService.getPharmacyById(pharmacyId));
        ePrescription.setPatient((Patient) Hibernate.unproxy(userService.findById(patientId)));
        ePrescription.setCode("EPR" + String.valueOf(ePrescriptionRepository.findAll().size() + 1));
        ePrescription.setePrescriptionItems(createEPrescriptionItems(codesWithQuantities, ePrescription));
        double priceWithDiscount = loyaltyProgramService.
                calculatePriceBasedOnUserCategory(ePrescription.getPatient().getId(), ePrescription.getPrice());
        ePrescription.setPrice(priceWithDiscount);
        try {
            updatePharmacyStorageQuantities(ePrescription.getePrescriptionItems(), pharmacyId);
            ePrescription.setePrescriptionState(EPrescriptionState.CONFIRMED);
            return ePrescriptionRepository.save(ePrescription);
        } catch (Exception e) {
            ePrescription.setePrescriptionState(EPrescriptionState.REJECTED);
            return ePrescriptionRepository.save(ePrescription);
        }
    }

    @Transactional(rollbackOn = InvalidMedicineAmountException.class)
    public void updatePharmacyStorageQuantities(List<EPrescriptionItem> items, Long pharmacyId) throws InvalidMedicineAmountException {
        try {
            for (EPrescriptionItem item : items) {
                pharmacyMedicineService.reduceMedicineQuantityInPharmacy(item.getMedicine().getCode(),item.getQuantity(),
                        pharmacyId);
            }
        } catch (InvalidMedicineAmountException e) {
            throw new InvalidMedicineAmountException(e.toString());
        }
    }

    public List<EPrescriptionItem> createEPrescriptionItems(HashMap<String, Integer> codesWithQuantities,
                                                            EPrescription ePrescription) {
        List<EPrescriptionItem> items = new ArrayList<>();
        for (String code : codesWithQuantities.keySet()) {
            EPrescriptionItem item = new EPrescriptionItem();
            item.setQuantity(codesWithQuantities.get(code));
            item.setMedicine(medicineService.findByCode(code));
            items.add(item);
            item.setePrescription(ePrescription);
        }
        return items;
    }

    public List<EPrescription> getEPrescriptionsForPatient(Long patientId) {
        return ePrescriptionRepository.findByPatientId(patientId);
    }

    public void sendEmailForEPrescription(EPrescription ePrescription) {
        StringBuilder sb = new StringBuilder(
                "Poštovani/-a, <br><br> Lekovi su uspešno izdati preko e-recepta! <br><br> <b>Osnovne informacije o receptu:</b>" +
                        "<br>- Apoteka: " + ePrescription.getPharmacy().getName() +
                        "<br>- Spsiak lekova: " +
                        "<table><tr><th>Šifra leka:</th><th>Naziv leka:</th><th>Količina:</th>");
        for (EPrescriptionItem item : ePrescription.getePrescriptionItems()) {
            sb.append("<tr><td style=\"text-align: center; border: 1px solid;\">" + item.getMedicine().getCode() + "</td>");
            sb.append("<td style=\"text-align: center; border: 1px solid;\">" + item.getMedicine().getName() + "</td>");
            sb.append("<td style=\"text-align: center; border: 1px solid;\">" + item.getQuantity() + "</td></tr>");
        }
        sb.append("</table><br>- Ukupna cena: " + ePrescription.getPrice() + " RSD"+
                "<br><br>S poštovanjem, <br>Vaša ISA");
        emailService.sendEmailAsync(ePrescription.getPatient(), "Izdavanje e-recepta", sb.toString());
    }
}
