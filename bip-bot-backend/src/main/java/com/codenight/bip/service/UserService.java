package com.codenight.bip.service;

import com.codenight.bip.domain.User;
import com.codenight.bip.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepo userRepo;

    @Transactional(readOnly = true)
    public List<User> list() { return userRepo.findAll(); }

    @Transactional(readOnly = true)
    public User get(String userId) { return userRepo.findById(userId).orElseThrow(); }

    public User create(User u) {
        if (u.getUserId() == null || u.getUserId().isBlank())
            throw new IllegalArgumentException("userId zorunlu");
        return userRepo.save(u);
    }

    public User update(String id, User body) {
        User u = get(id);
        if (body.getName() != null)  u.setName(body.getName());
        if (body.getRole() != null)  u.setRole(body.getRole());
        return userRepo.save(u);
    }

    public void delete(String id) { userRepo.deleteById(id); }
}
