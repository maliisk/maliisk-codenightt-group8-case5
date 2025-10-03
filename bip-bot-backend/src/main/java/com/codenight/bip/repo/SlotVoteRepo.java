package com.codenight.bip.repo;



import com.codenight.bip.domain.Choice;
import com.codenight.bip.domain.SlotVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SlotVoteRepo extends JpaRepository<SlotVote, Long> {

    // (eski) sadece slotId + choice sayımı
    long countBySlot_SlotIdAndChoice(Long slotId, Choice choice);

    // (YENİ – önerilen) event + slot + choice ile sayım (çakışmaları önler)
    long countByEvent_EventIdAndSlot_SlotIdAndChoice(Long eventId, Long slotId, Choice choice);

    // Aynı kullanıcı aynı slot için tek oy (Event + Slot + User)
    Optional<SlotVote> findByEvent_EventIdAndSlot_SlotIdAndUserId(Long eventId, Long slotId, String userId);

    // İstenirse: kullanıcının etkinlikteki tüm slot oyları
    List<SlotVote> findByEvent_EventIdAndUserId(Long eventId, String userId);

    // Moderatör ekranında YES verenlerin listesi vb. için (opsiyonel)
    List<SlotVote> findByEvent_EventIdAndSlot_SlotIdAndChoice(Long eventId, Long slotId, Choice choice);
}
