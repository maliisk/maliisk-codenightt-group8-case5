package com.codenight.bip.repo;

import com.codenight.bip.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SlotRepo extends JpaRepository<Slot, Long> {
    List<Slot> findByEvent_EventId(Long eventId);
}

