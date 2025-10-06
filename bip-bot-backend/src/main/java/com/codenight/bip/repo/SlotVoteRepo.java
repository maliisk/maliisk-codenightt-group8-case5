package com.codenight.bip.repo;



import com.codenight.bip.domain.Choice;
import com.codenight.bip.domain.SlotVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SlotVoteRepo extends JpaRepository<SlotVote, Long> {

    long countBySlot_SlotIdAndChoice(Long slotId, Choice choice);

    long countByEvent_EventIdAndSlot_SlotIdAndChoice(Long eventId, Long slotId, Choice choice);

    Optional<SlotVote> findByEvent_EventIdAndSlot_SlotIdAndUserId(Long eventId, Long slotId, String userId);

    List<SlotVote> findByEvent_EventIdAndUserId(Long eventId, String userId);

    List<SlotVote> findByEvent_EventIdAndSlot_SlotIdAndChoice(Long eventId, Long slotId, Choice choice);
}
