package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.repository.UserRepository

class LogoutUseCase(private val userRepository: UserRepository) {
    suspend fun execute(refreshToken: String) = userRepository.logout(refreshToken)
}
