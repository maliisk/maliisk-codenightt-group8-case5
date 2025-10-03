package com.codenight.bip.repo;

import com.codenight.bip.domain.MessageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface MessageRepo extends JpaRepository<MessageLog, Long> {
    List<MessageLog> findTop200ByGroupIdOrderByCreatedAtAsc(String groupId);
    long deleteByGroupId(String groupId);

}
